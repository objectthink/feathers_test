var NATS = require('nats');
var instrumentInfoDict = {};
var instrumentAlias = {};
var nats;
var sid;

var macs = [];
var names = [];
var locations = [];
var its = [];


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try 
    {
        console.log('handler called');
        
        //console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        // if (event.session.application.applicationId !== "") {
        //     context.fail("Invalid Application ID");
        //  }

        if (event.session.new) 
        {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        
        if (event.request.type === "LaunchRequest") 
        {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) 
                {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") 
        {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) 
                {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") 
        {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) 
    {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
 function onSessionStarted(sessionStartedRequest, session) {
    console.log('session started!');

    //var servers = ['nats://52.203.231.127:4222'];
    //nats = NATS.connect("nats://52.203.231.127:4222");
    
    var servers = ['nats://www.taclouddemo.com:4222'];
    nats = NATS.connect({servers: servers, yieldTime: 10});
    
    session.nats = nats;
    session.instrumentInfo = {};

    session.attributes = {
        "speechOutput": '',
        "repromptText": ''
    };
    
    onStartup(session);
 }
 
 function onStartup(session) {
    // add any session init logic here
    console.log('startup!!!');
    
    /////NATS TEST
    //var NATS = require('nats');
    //nats = NATS.connect("nats://52.203.231.127:4222");

    // Simple Subscriber
    //MSG IS INSTRUMENT ID
    
    if(session.nats)
    {
        console.log('got nats!');
        console.log(session.nats.currentServer.url.host);
    }
    
    var theNats = session.nats;
    /*
    sid = session.nats.subscribe('heartbeat', function(msg) {

      //console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:' + msg);
      
      //update advertisement reciept
      //instrumentAdvertisementDict[msg] = new Date();
      
      var processing = 0
      if( !(msg in instrumentInfoDict) && processing == 0)
      {
        processing = 1
        console.log('got heartbeat:' + msg)
        
        //theNats.unsubscribe(sid)
        
        instrumentInfoDict[msg] = {
          mac:msg,
          serialnumber:null,
          place:"",
          runState:"",
          model:"",
          name:null,
          instrumentType:""
        }
        
        macs.push(msg)
        
        //update
        //fecth location
        theNats.request(msg + '.get', 'location', {'max':1}, function(response) {
          console.log('location: ' + response);
          instrumentInfoDict[msg].place = response;
          locations.push(response)
        });

        //fecth serial number
        theNats.request(msg + '.get', 'serial number', {'max':1}, function(response) {
          console.log('serial number: ' + response);
          instrumentInfoDict[msg].serialnumber = response;
        });
        
        //fecth name
        theNats.request(msg + '.get', 'name', {'max':1}, function(response) {
          console.log('name: ' + response);
          instrumentInfoDict[msg].name = response;
          names.push(response)
        });
        
        //fecth name
        theNats.request(msg + '.get', 'instrument type', {'max':1}, function(response) {
          console.log('instrument type: ' + response);
          instrumentInfoDict[msg].instrumentType = response;
          its.push(response)
        });

        processing = 0
      }
    });
    */
    
    instrumentInfoDict["00:19:b8:01:e4:63"] = {
        mac:"00:19:b8:01:e4:63",
        serialnumber:"",
        location:"R and D",
        runState:"",
        model:"",
        name:"the artist",
        instrumentType:"DSC"
    };

    instrumentInfoDict["00:19:b8:01:e4:4e"] = {
        mac:"00:19:b8:01:e4:4e",
        serialnumber:"",
        location:"lab",
        runState:"",
        model:"",
        name:"dagny",
        instrumentType:"DSC"
    };

    instrumentInfoDict["00:19:b8:02:06:5e"] = {
        mac:"00:19:b8:02:06:5e",
        serialnumber:"",
        location:"R and D lab",
        runState:"",
        model:"",
        name:"Dio",
        instrumentType:"DSC"
    }; 
    
    instrumentInfoDict["00:19:b8:01:e4:5e"] = {
        mac:"00:19:b8:01:e4:5e",
        serialnumber:"",
        location:"pluto",
        runState:"",
        model:"",
        name:"halo",
        instrumentType:"SDT"
    };
    
    instrumentInfoDict["00:19:b8:01:9a:69"] = {
        mac:"00:19:b8:01:9a:69",
        serialnumber:"",
        location:"new castle lab",
        runState:"",
        model:"",
        name:"nano 1",
        instrumentType:"HP TGA"
    };
    
    instrumentAlias["deeo"] = {alias:"Dio"};
    instrumentAlias["DO"] = {alias:"Dio"};
 }

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
   console.log('session ended!!!');
   instrumentInfoDict = {};
   macs = [];
   names = [];
   locations = [];
   its = [];

   nats.close();
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  console.log('onlaunch');
  //onStartup(session);
  //onGetInfo();
  getWelcomeResponse(session, callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if        (intentName == "StartAll")            {
        handleStartAllResponse(intent, session, callback);
    } else if (intentName == "StopAll")             {
        handleStopAllResponse(intent, session, callback);
    } else if (intentName == "InstrumentInfo")      {
        handleInstrumentInfoResponse(intent, session, callback);
    } else if ( intentName == "StartExperimentOn")  {
        handleStartExperimentOn(intent, session, callback);
    } else if ( intentName == "StopExperimentOn")  {
        handleStopExperimentOn(intent, session, callback);

    } else if ( intentName == "CreateExperimentOn")  {
        handleCreateExperimentOn(intent, session, callback);

    } else if ( intentName == "AddSegmentWith")  {
        handleAddSegmentWithExperimentOn(intent, session, callback);

    } else if ( intentName == "CloseExperimentOn")  {
        handleCloseExperimentOn(intent, session, callback);
        
    } else if (intentName == "AMAZON.YesIntent")    {
        handleYesResponse(intent, session, callback);
    } else if (intentName == "AMAZON.NoIntent")     {
        handleNoResponse(intent, session, callback);
    } else if (intentName == "AMAZON.HelpIntent")   {
        handleGetHelpRequest(intent, session, callback);
    } else if (intentName == "AMAZON.StopIntent")   {
        handleFinishSessionRequest(intent, session, callback);
    } else if (intentName == "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback);
    } else                                          {
        throw "Invalid intent";
    }
}

function handleCloseExperimentOn(intent, session, callback) {

    var speechOutput  = "done";
    var repromptText  = "";
    var header        = "Mercury Instrument Manager";

    var name = intent.slots.INSTRUMENT_NAME.value;
    var found = null;
    
    if(instrumentAlias[name])
        name = instrumentAlias[name].alias;
        
    for(var mac in instrumentInfoDict)
    {
        console.log('IN CLOSE WITH:' + instrumentInfoDict[mac].name + ' and ' + name);
        if(instrumentInfoDict[mac].name == name) 
        {
            found = mac;
            break;
        }
    }

    if(found)
    {
        nats.publish(found + '.set.procedure', '<procedure bytes>');
    }
    else
    {
        speechOutput = "an instrument with that name was not found";
    }
    
    var shouldEndSession = false;

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
}

function handleAddSegmentWithExperimentOn(intent, session, callback) {

    var speechOutput  = "done";
    var repromptText  = "";
    var header        = "Mercury Instrument Manager";

    var name = intent.slots.INSTRUMENT_NAME.value;
    var found = null;
    
    if(instrumentAlias[name])
        name = instrumentAlias[name].alias;
        
    for(var mac in instrumentInfoDict)
    {
        console.log('IN SEGMENT WITH:' + instrumentInfoDict[mac].name + ' and ' + name);
        if(instrumentInfoDict[mac].name == name) 
        {
            found = mac;
            break;
        }
    }

    if(found)
    {
        nats.publish(found + '.set.segment', '<segment bytes>');
    }
    else
    {
        speechOutput = "you must create an experiment first!";
    }
    
    var shouldEndSession = false;

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
}

function handleCreateExperimentOn(intent, session, callback) {

    var speechOutput  = "done";
    var repromptText  = "";
    var header        = "Mercury Instrument Manager";

    var name = intent.slots.INSTRUMENT_NAME.value;
    var found = null;
    
    if(instrumentAlias[name])
        name = instrumentAlias[name].alias;
        
    for(var mac in instrumentInfoDict)
    {
        console.log('IN CREATE WITH:' + instrumentInfoDict[mac].name + ' and ' + name);
        if(instrumentInfoDict[mac].name == name) 
        {
            found = mac;
            break;
        }
    }

    if(found)
    {
        nats.publish(found + '.action', 'create');
        session.name = name;
    }
    else
    {
        speechOutput = "an instrument with that name was not found";
        session.name = null;
    }
    
    var shouldEndSession = false;

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
}

function handleStartExperimentOn(intent, session, callback) {

    var speechOutput  = "done";
    var repromptText  = "";
    var header        = "Mercury Instrument Manager";

    var name = intent.slots.INSTRUMENT_NAME.value;
    var found = null;
    
    if(instrumentAlias[name])
        name = instrumentAlias[name].alias;
        
    for(var mac in instrumentInfoDict)
    {
        console.log('IN START WITH:' + instrumentInfoDict[mac].name + ' and ' + name);
        if(instrumentInfoDict[mac].name == name) 
        {
            found = mac;
            break;
        }
    }

    if(found)
    {
        nats.publish(found + '.action', 'start');
        //speechOutput = instrumentInfoDict[found].place;
    }
    else
    {
        speechOutput = "an instrument with that name was not found";
    }
    
    var shouldEndSession = false;

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
}

function handleStopExperimentOn(intent, session, callback) {

    var speechOutput  = "done";
    var repromptText  = "";
    var header        = "Mercury Instrument Manager";

    var name = intent.slots.INSTRUMENT_NAME.value;
    var found = null;
    
    for(var mac in instrumentInfoDict)
    {
        //var namelc = name.toLowerCase();
        if(instrumentInfoDict[mac].name == name) 
        {
            found = mac;
            break;
        }
    }
    
    if(found)
    {
        nats.publish(found + '.action', 'stop');
    }
    else
    {
        speechOutput = "an instrument with that name was not found";
    }
    
    var shouldEndSession = false

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleInstrumentInfoResponse(intent, session, callback) {
    console.log('in handleInstrumentInfoResponse')
    
    var speechOutput  = ""
    var repromptText  = ""
    var header        = "Mercury Instrument Manager"

/*
    for(var mac in macs)
    {
        console.log(macs[mac])
    }
    
    for(var name in names)
    {
        console.log(names[name])
    }
*/
    
/*
    for(var location in locations)
    {
        console.log(locations[location])
    }
    
    if(names.length == 0 || locations.length == 0)
    {
        speechOutput = "that information is not available yet!!";
    }else if(names.length > 0)//names.length == locations.length)
    {
        for(var index in names)
        {
            //speechOutput = "do something here";
            speechOutput += names[index]  + 'is a ' + its[index] + '<break time="1s"/>'
            //speechOutput += names[index] + " location is " + locations[index] + '<break time="1s"/>'
        }
    }
    else
    {
        speechOutput = "that information is not ready yet";
    }
*/

/*
    //fecth name
    session.nats.request('00:19:b8:01:e4:4e.get', 'name', {'max':1}, function(response) {
      console.log('name: ' + response);

      var shouldEndSession = false

      speechOutput = 'my name is ' + response
        
      callback(
          session.attributes, 
          buildSpeechletResponse(
              header, 
              speechOutput, 
              repromptText, 
              shouldEndSession))
    });
*/

    for(var mac in instrumentInfoDict)
    {
        console.log('handleInstrumentInfoResponse:' + mac);
        
        if(instrumentInfoDict[mac])
        {

            if(instrumentInfoDict[mac].name) 
            {
                console.log('have name:' + instrumentInfoDict[mac].name);
                if(instrumentInfoDict[mac].instrumentType)
                {
                    console.log('have type:' + instrumentInfoDict[mac].instrumentType);
                    speechOutput += 
                        instrumentInfoDict[mac].name + 
                        " is a " + 
                        instrumentInfoDict[mac].instrumentType + 
                        " whose location is " +
                        instrumentInfoDict[mac].location +
                        '<break time="1s"/>';
                }
                else
                {
                    speechOutput = "that information is not ready yet place";
                    break;
                }
            }
            else
            {
                speechOutput = "that information is not ready yet name";
                break;
            }
        }
        else
        {
            speechOutput = "that information is not ready yet entry";
            break;
        }
    }

    var shouldEndSession = false

    callback(session.attributes, buildSSMLSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleStartAllResponse(intent, session, callback) {

    var speechOutput  = "sorry, kavitha, i can't let you do that";
    var repromptText  = "";
    var header        = "Mercury Instrument Manager";

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

    var speechOutput  = "sorry, kavitha, i can't let you do that"
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

function getWelcomeResponse(session, callback) {
  var speechOutput      = "Hi, I am here to help manage your enterprise connected instruments"
  var reprompt          = "Let me know when you are ready"
  var header            = "Mercury Instrument Manager"
  
  var shouldEndSession  = false

  session.attributes.speechOutput = speechOutput
  session.attributes.reprompt = reprompt
  
  callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
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
