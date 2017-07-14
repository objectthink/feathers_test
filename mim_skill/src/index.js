var instrumentInfoDict = {};
var nats;

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here

    /////NATS TEST
    var NATS = require('nats');
    nats = NATS.connect("nats://52.203.231.127:4222");

    // Simple Subscriber
    //MSG IS INSTRUMENT ID
    nats.subscribe('heartbeat', function(msg) {

      //update advertisement reciept
      //instrumentAdvertisementDict[msg] = new Date();

      if( !(msg in instrumentInfoDict))
      {
        console.log('got heartbeat:' + msg)
        
        instrumentInfoDict[msg] = {
          mac:msg,
          serialnumber:null,
          location:"",
          runState:"",
          model:"",
          name:null,
          instrumentType:""
        };
        
        //update
        //fecth location
        nats.request(msg + '.get', 'location', {'max':1}, function(response) {
          console.log('location: ' + response);

          if(instrumentInfoDict[msg])
          {
            instrumentInfoDict[msg].location = response;
          }
        });

        //fecth serial number
        /*
        nats.request(msg + '.get', 'serial number', {'max':1}, function(response) {
          console.log('serial number: ' + response);

          if(instrumentInfoDict[msg])
          {
            instrumentInfoDict[msg].serialnumber = response;
          }
        });
        */
        
        //fecth name
        nats.request(msg + '.get', 'name', {'max':1}, function(response) {
          console.log('name: ' + response);

          if(instrumentInfoDict[msg])
          {
            instrumentInfoDict[msg].name = response;
          }
        });
      }
    });
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if        (intentName == "StartAll")            {
        handleStartAllResponse(intent, session, callback)
    } else if (intentName == "StopAll")             {
        handleStopAllResponse(intent, session, callback)   
    } else if (intentName == "InstrumentInfo")      {
        handleInstrumentInfoResponse(intent, session, callback)
    } else if ( intentName == "StartExperimentOn")  {
        handleStartExperimentOn(intent, session, callback)
    } else if ( intentName == "StopExperimentOn")  {
        handleStopExperimentOn(intent, session, callback)
    } else if (intentName == "AMAZON.YesIntent")    {
        handleYesResponse(intent, session, callback)
    } else if (intentName == "AMAZON.NoIntent")     {
        handleNoResponse(intent, session, callback)
    } else if (intentName == "AMAZON.HelpIntent")   {
        handleGetHelpRequest(intent, session, callback)
    } else if (intentName == "AMAZON.StopIntent")   {
        handleFinishSessionRequest(intent, session, callback)
    } else if (intentName == "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else                                          {
        throw "Invalid intent"
    }
}

function handleStartExperimentOn(intent, session, callback) {

    var speechOutput  = ""
    var repromptText  = ""
    var header        = "Mercury Instrument Manager"

    var name = intent.slots.INSTRUMENT_NAME.value
    var found = null
    
    for(var mac in instrumentInfoDict)
    {
        if(instrumentInfoDict[mac].name == name) 
        {
            found = mac
            break
        }
    }
    
    if(found)
    {
        nats.publish(found + '.action', 'start');
        speechOutput = "done";
    }
    else
    {
        speechOutput = "an instrument with that name was not found";
    }
    
    var shouldEndSession = false

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleStopExperimentOn(intent, session, callback) {

    var speechOutput  = ""
    var repromptText  = ""
    var header        = "Mercury Instrument Manager"

    var name = intent.slots.INSTRUMENT_NAME.value
    var found = null
    
    for(var mac in instrumentInfoDict)
    {
        if(instrumentInfoDict[mac].name == name) 
        {
            found = mac
            break
        }
    }
    
    if(found)
    {
        nats.publish(found + '.action', 'stop');
        speechOutput = "done";
    }
    else
    {
        speechOutput = "an instrument with that name was not found";
    }
    
    var shouldEndSession = false

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleInstrumentInfoResponse(intent, session, callback) {

    var speechOutput  = ""
    var repromptText  = ""
    var header        = "Mercury Instrument Manager"

    for(var mac in instrumentInfoDict)
    {
        if(instrumentInfoDict[mac].name) 
        {
            speechOutput += instrumentInfoDict[mac].name + " location is " + instrumentInfoDict[mac].location + '<break time="1s"/>'
        }
        else
        {
            speechOutput = "that information is not ready yet";
            break;
        }
    }
    
    var shouldEndSession = false

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleStartAllResponse(intent, session, callback) {

    var speechOutput  = "sorry steve, that function has been disabled so you don't mess up someones experiment"
    var repromptText  = ""
    var header        = "Mercury Instrument Manager"

    var shouldEndSession = false

/*
    for (var mac in instrumentInfoDict) {
        console.log('about to publish to:' + mac)
        if(nats)
        {
           nats.publish(mac + '.action', 'start');
        }
    }
*/

    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleStopAllResponse(intent, session, callback) {

    var speechOutput  = "sorry steve, i can't let you do that"
    var repromptText  = ""
    var header        = "Mercury Instrument Manager"

    var shouldEndSession = false

/*
    for (var mac in instrumentInfoDict) {
        console.log('about to publish to:' + mac)
        if(nats)
        {
           nats.publish(mac + '.action', 'stop');
        }
    }
*/

    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
  var speechOutput      = "Hi, I am here to help manage your enterprise connected instruments"
  var reprompt          = "Let me know when you are ready"
  var header            = "Mercury Instrument Manager"
  
  var shouldEndSession  = false

  var sessionAttributes = {
    "speechOutput" : speechOutput,
    "repromptText" : reprompt
  }

  callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


// ------- Helper functions to build responses for Alexa -------
function buildSSMLSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + output + "</speak>"
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
