'use strict';

const hooks = require('./hooks');

var instrumentInfoDict = {};
var instrumentAdvertisementDict = {};
var instrumentSubscriptions = {};
var nats;

//var instrumentInfoArray = [];

var deviceIds = ["19A9AC9B4B8FB08650248A941FC78C22358D4EA81ECB8C050B31FE9CCF56D784","FD7E53DB548493D4CBE795F9A97C1543E92D47FB3892E9B5500DE0F21D0068CE"];

class Service {
  constructor(options) {
    this.options = options || {};

  }

  setup(app, path)
  {
      console.log(app);
      console.log(path);

      this.app = app;
  }

  sendAPNSString(item, s)
  {
    var apn = require('apn');

    // Set up apn with the APNs Auth Key
    var apnProvider = new apn.Provider({
         token: {
            key: 'apns.p8', // Path to the key p8 file
            keyId: '8AGAMF95MV', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
            teamId: '6AP8DGBG6H', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
        },
        production: false // Set to true if sending a notification to a production iOS app
    });

    //get list of device tokens from the device tokens service
    var deviceTokensService = this.app.service('/deviceTokens');
    deviceTokensService.find().then((data)=>{
      //console.log(data.data);

      //iterate over the tokens and send push notification
      for(var i in data.data)
      {
        //console.log(data.data[i].token);

        var deviceToken = data.data[i].deviceToken;

        // Prepare a new notification
        var notification = new apn.Notification();

        // Specify your iOS app's Bundle ID (accessible within the project editor)
        notification.topic = 'com.objectthink.mim.demo.mim-demo';

        // Set expiration to 1 hour from now (in case device is offline)
        notification.expiry = Math.floor(Date.now() / 1000) + 3600;

        // Set app badge indicator
        //notification.badge = 3;

        // Play ping.aiff sound when the notification is received
        //notification.sound = 'ping.aiff';

        // Display the following message (the actual notification text, supports emoji)
        //notification.alert = 'Hello World \u270C';
        //notification.alert = item.serialnumber + ':' + item.runState;
        notification.title = item.serialnumber;
        notification.body = s;

        // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
        notification.payload = {id: 123};

        // Actually send the notification
        apnProvider.send(notification, deviceToken).then(function(result) {
            // Check the result for any failed devices
            console.log(result);
        });
      }
    });

    ///////////

    //TEST CODE
    //iterate of device ids
    //for(var i=0; i < deviceIds.length; i++)
    //{
    //}

    // Enter the device token from the Xcode console
    //var deviceToken = '19A9AC9B4B8FB08650248A941FC78C22358D4EA81ECB8C050B31FE9CCF56D784';

  }

  sendAPNS(item)
  {
    var apn = require('apn');

    // Set up apn with the APNs Auth Key
    var apnProvider = new apn.Provider({
         token: {
            key: 'apns.p8', // Path to the key p8 file
            keyId: '8AGAMF95MV', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
            teamId: '6AP8DGBG6H', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
        },
        production: false // Set to true if sending a notification to a production iOS app
    });

    //get list of device tokens from the device tokens service
    var deviceTokensService = this.app.service('/deviceTokens');
    deviceTokensService.find().then((data)=>{
      //console.log(data.data);

      //iterate over the tokens and send push notification
      for(var i in data.data)
      {
        //console.log(data.data[i].token);

        var deviceToken = data.data[i].deviceToken;

        // Prepare a new notification
        var notification = new apn.Notification();

        // Specify your iOS app's Bundle ID (accessible within the project editor)
        notification.topic = 'com.objectthink.mim.demo.mim-demo';

        // Set expiration to 1 hour from now (in case device is offline)
        notification.expiry = Math.floor(Date.now() / 1000) + 3600;

        // Set app badge indicator
        notification.badge = 3;

        // Play ping.aiff sound when the notification is received
        notification.sound = 'ping.aiff';

        // Display the following message (the actual notification text, supports emoji)
        //notification.alert = 'Hello World \u270C';
        //notification.alert = item.serialnumber + ':' + item.runState;
        notification.title = item.serialnumber;
        notification.body = item.runState;

        // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
        notification.payload = {id: 123};

        // Actually send the notification
        apnProvider.send(notification, deviceToken).then(function(result) {
            // Check the result for any failed devices
            console.log(result);
        });
      }
    });

    ///////////

    //TEST CODE
    //iterate of device ids
    //for(var i=0; i < deviceIds.length; i++)
    //{
    //}

    // Enter the device token from the Xcode console
    //var deviceToken = '19A9AC9B4B8FB08650248A941FC78C22358D4EA81ECB8C050B31FE9CCF56D784';
  }

  find(params) {
    //return Promise.resolve([{id:"1", mac:"0a-1b-3c-4d-5e-6f", serialnumber:"RIODIO", location:"LABORATORY"}]);

    //console.log('find!');

    if(params.query.reset==='true')
    {
      console.log('resetting');
      instrumentInfoDict = {};
    }

    var instrumentInfoArray = [];

    for (var mac in instrumentInfoDict) {
      instrumentInfoArray.push(instrumentInfoDict[mac]);
    }

    return Promise.resolve(instrumentInfoArray);
  }

//      id, text: `A new message with ID: ${id}!`

  get(mac, params) {
    return Promise.resolve(
      instrumentInfoDict[mac]
    );
  }

  create(data, params) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

  update(id, data, params) {
    console.log('itemService.update');

    if(params)
    if(params.query)
    if(params.query.sendToInstrument === 'true')
    {
      console.log('send to instrument requested: ' + params.query.which + ':' + data.location);

      nats.request(
        data.mac + '.set.' + params.query.which,
        data.location,
        {'max':1},
        function(response) {
          console.log('update: ' + response);

          if(response === "SUCCESS")
          {
            instrumentInfoDict[data.mac] = data;
          }
      });
    }

    console.log('itemService.update return ' + data);
    return Promise.resolve(data);
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/items', new Service());

  // Get our initialize service to that we can bind hooks
  const itemService = app.service('/items');

  // Set up our before hooks
  itemService.before(hooks.before);

  // Set up our after hooks
  itemService.after(hooks.after);

  /////NATS TEST
  var NATS = require('nats');
  nats = NATS.connect();

  // Simple Publisher
  nats.publish('foo', 'Hello World!');

  // Simple Subscriber
  //MSG IS INSTRUMENT ID
  nats.subscribe('heartbeat', function(msg) {

    //update advertisement reciept
    instrumentAdvertisementDict[msg] = new Date();

    if( !(msg in instrumentInfoDict))
    {

      console.log(msg);

      instrumentInfoDict[msg] = {
        mac:msg,
        serialnumber:"serialnumber",
        location:"location",
        runState:"Idle",
        model:"",
        instrumentType:"DSC"
      };

      itemService.create(instrumentInfoDict[msg]);

      //update
      //fecth location
      nats.request(msg + '.get', 'location', {'max':1}, function(response) {
        console.log('location: ' + response);

        instrumentInfoDict[msg].location = response;

        itemService.update(msg, instrumentInfoDict[msg]);
      });

      //fecth serial number
      nats.request(msg + '.get', 'serial number', {'max':1}, function(response) {
        console.log('serial number: ' + response);

        instrumentInfoDict[msg].serialnumber = response;

        itemService.update(msg, instrumentInfoDict[msg]);
      });

      //fecth run state
      nats.request(msg + '.get', 'run state', {'max':1}, function(response) {
        console.log('run state: ' + response);

        instrumentInfoDict[msg].runState = response;

        itemService.update(msg, instrumentInfoDict[msg]);
      });

      //update
      //fecth instrument model
      nats.request(msg + '.get', 'instrument model', {'max':1}, function(response) {
        console.log('location: ' + response);

        instrumentInfoDict[msg].model = response;

        itemService.update(msg, instrumentInfoDict[msg]);
      });

      //update
      //fecth instrument type
      nats.request(msg + '.get', 'instrument type', {'max':1}, function(response) {
        console.log('location: ' + response);

        instrumentInfoDict[msg].instrumentType = response;

        itemService.update(msg, instrumentInfoDict[msg]);
      });

      //listen for run state changes
      var sid = nats.subscribe(msg + '.runstate', function(runstate) {
        console.log(runstate);

        instrumentInfoDict[msg].runState = runstate;

        itemService.update(msg, instrumentInfoDict[msg]);

        itemService.sendAPNS(instrumentInfoDict[msg]);
      });

      //listen for real time signals
      var sid = nats.subscribe(msg + '.realtimesignalsstatus', function(response) {
        //console.log(runstate);

        instrumentInfoDict[msg].realtimesignalsstatus = response;

        //itemService.update(msg, instrumentInfoDict[msg]);
      });

      //listen for instrument events
      var sid = nats.subscribe(msg + '.event', function(s) {
        console.log('event:' + s);

        itemService.sendAPNSString(instrumentInfoDict[msg], 'event:' + s);
      });

      //listen for instrument errors
      var sid = nats.subscribe(msg + '.error', function(s) {
        console.log('error:' + s);

        itemService.sendAPNSString(instrumentInfoDict[msg], 'error:' + s);
      });

      instrumentSubscriptions[msg] = sid;

      /////////////////
    }

  });

  //remove stale heartbeats
  function staleAdvertisementCheck() {

    setTimeout(function()
    {
      var now = new Date();

      for (var mac in instrumentAdvertisementDict) {

        //console.log(mac);
        //console.log(now - instrumentAdvertisementDict[mac]);

        if( (now - instrumentAdvertisementDict[mac]) > 2000)
        {
          //remove stale advertisement
          console.log('removing stale heartbeat:' + mac);

          delete instrumentAdvertisementDict[mac];
          delete instrumentInfoDict[mac];

          nats.unsubscribe(instrumentSubscriptions[mac]);

          delete instrumentSubscriptions[mac];

          itemService.remove(mac);
        }
      }
      staleAdvertisementCheck();
    },
    1000);
  }

  //////////////
  staleAdvertisementCheck();
};


module.exports.Service = Service;
