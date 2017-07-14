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

  /*
  save app feathers app reference to later
  access services
  */
  setup(app, path)
  {
      console.log(app);
      console.log(path);

      this.app = app;

      var couchbase = require('couchbase');
      var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
      var bucket = cluster.openBucket('instrument_info');

      this.bucket = bucket;
  }

  requestNotificationForDeviceToken(item, deviceToken, aMessage)
  {
    var itemService = this.app.service('/items');
    var userSettingsService = this.app.service('/userSettings');

    // get any settings for this device token ( user )
    userSettingsService.find({query: {deviceToken: deviceToken}}).then((userSettings)=>{
      console.log('found:' + userSettings.data.length);

      //if filter is found use it otherwsie send all
      if(userSettings.data.length == 1)
      {
        if(item.serialnumber.includes(userSettings.data[0].serialNumberContains))
        {
          console.log("SEND!!!")
          itemService.sendNotificationTo(item, deviceToken, aMessage);
        }
        else
        {
          console.log("DO NOT SEND!!!")
        }
      }
      else
      {
        itemService.sendNotificationTo(item, deviceToken, aMessage);
      }
    });

  }

  requestNotificationForDeviceToken(item, deviceToken, aMessage)
  {
    var itemService = this.app.service('/items');
    var userSettingsService = this.app.service('/userSettings');

    // get any settings for this device token ( user )
    userSettingsService.find({query: {deviceToken: deviceToken}}).then((userSettings)=>{
      console.log('found:' + userSettings.data.length);

      //if filter is found use it otherwsie send all
      if(userSettings.data.length == 1)
      {
        for(var i in userSettings.data[0].serialNumberContains)
        {
          console.log("   " + deviceToken);
          console.log("   " + userSettings.data[0].serialNumberContains[i]);
          console.log("   " + item.serialnumber);

          if(item.serialnumber.includes(userSettings.data[0].serialNumberContains[i]))
          {
            console.log("SEND!!!")
            itemService.sendNotificationTo(item, deviceToken, aMessage);

            break;
          }
          else
          {
            console.log("DO NOT SEND!!!")
          }
        }
      }
      else
      {
        itemService.sendNotificationTo(item, deviceToken, aMessage);
      }
    });

  }

  requestNotificationForDeviceTokenOLD(item, deviceToken, aMessage)
  {
    var itemService = this.app.service('/items');
    var userSettingsService = this.app.service('/userSettings');

    // get any settings for this device token ( user )
    userSettingsService.find({query: {deviceToken: deviceToken}}).then((userSettings)=>{
      console.log('found:' + userSettings.data.length);

      //if filter is found use it otherwsie send all
      if(userSettings.data.length == 1)
      {
        if(item.serialnumber.includes(userSettings.data[0].serialNumberContains))
        {
          console.log("SEND!!!")
          itemService.sendNotificationTo(item, deviceToken, aMessage);
        }
        else
        {
          console.log("DO NOT SEND!!!")
        }
      }
      else
      {
        itemService.sendNotificationTo(item, deviceToken, aMessage);
      }
    });

  }

  /*
  for all device tokens check if a user settings is available
  determine if a notification is desired based on these settings
  */
  requestNotification(item, aMessage)
  {
    //get list of device tokens from the device tokens service
    var itemService = this.app.service('/items');
    var deviceTokensService = this.app.service('/deviceTokens');

    deviceTokensService.find().then((deviceTokens)=>{
      //iterate over the tokens and check user settings
      for(var i in deviceTokens.data)
      {
        //console.log(deviceTokens.data[i].deviceToken);

        itemService.requestNotificationForDeviceToken(
          item,
          deviceTokens.data[i].deviceToken,
          aMessage
        )
      }
    });
  }

  sendNotificationTo(item, deviceToken, aMessage)
  {
    var apn = require('apn');

    // Set up apn with the APNs Auth Key
    var apnProvider = new apn.Provider({
         token: {
            key: 'apns.p8', // Path to the key p8 file
            keyId: '8AGAMF95MV', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
            teamId: '6AP8DGBG6H', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
        },
        production: true // Set to true if sending a notification to a production iOS app
    });

    // Prepare a new notification
    var notification = new apn.Notification();

    // Specify your iOS app's Bundle ID (accessible within the project editor)
    notification.topic = 'com.objectthink.dev.mim';
    //notification.topic = 'com.objectthink.mim.demo.mim-demo';

    // Set expiration to 1 hour from now (in case device is offline)
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;

    // Set app badge indicator
    notification.badge = 3;

    // Play ping.aiff sound when the notification is received
    notification.sound = 'ping.aiff';

    // Display the following message (the actual notification text, supports emoji)
    notification.title = item.name;
    notification.subtitle = item.instrumentType;
    notification.body = aMessage;

    notification.aps.threadId = item.mac;

    // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
    notification.payload = {instrumentId: item.mac};

    // Actually send the notification
    apnProvider.send(notification, deviceToken).then(function(result) {
        // Check the result for any failed devices
        console.log(result);

        if(result.failed.length > 0)
        {
          console.log(result.failed);
        }
    });
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

    if(params)
    {
      if(params.query)
      {

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

        if(params.query.command != '')
        {
          if(params.query.command === 'start')
          {
            console.log('start requested')

            nats.request(id + '.action', 'start', {'max':1}, function(response) {
              console.log('start request: ' + response);
            });
          }

          if(params.query.command === 'stop')
          {
            console.log('stop requested')

            nats.request(id + '.action', 'stop', {'max':1}, function(response) {
              console.log('stop request: ' + response);
            });
          }
        }
      }
    }

    return Promise.resolve(data);
  }

  updateDB(id, item)
  {
    this.bucket.upsert(id, item, function(err, result)
    {
      if(err){
        console.log('error updating db:' + err)
      }
      else {
        //console.log('updated instrument info:  ' + item)
      }
    });
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
  //nats = NATS.connect("nats://54.236.40.91:4222");
  nats = NATS.connect();

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
        name:"---",
        serialnumber:"---",
        location:"---",
        runState:"---",
        model:"---",
        instrumentType:"---",
        procedurestatus:{},
        realtimesignalsstatus:[]
      };

      instrumentSubscriptions[msg] = {
        subscriptions:[]
      }

      itemService.create(instrumentInfoDict[msg]);
      itemService.updateDB(msg, instrumentInfoDict[msg]);

      //update
      //fecth name
      nats.request(msg + '.get', 'name', {'max':1}, function(response) {
        console.log('name: ' + response);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].name = response;

          itemService.update(msg, instrumentInfoDict[msg]);
          itemService.updateDB(msg, instrumentInfoDict[msg]);
        }
      });

      //fecth location
      nats.request(msg + '.get', 'location', {'max':1}, function(response) {
        console.log('location: ' + response);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].location = response;

          itemService.update(msg, instrumentInfoDict[msg]);
          itemService.updateDB(msg, instrumentInfoDict[msg]);
        }
      });

      //fecth serial number
      nats.request(msg + '.get', 'serial number', {'max':1}, function(response) {
        console.log('serial number: ' + response);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].serialnumber = response;

          itemService.update(msg, instrumentInfoDict[msg]);
          itemService.updateDB(msg, instrumentInfoDict[msg]);
        }
      });

      //fecth run state
      nats.request(msg + '.get', 'run state', {'max':1}, function(response) {
        console.log('run state: ' + response);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].runState = response;

          itemService.update(msg, instrumentInfoDict[msg]);
          itemService.updateDB(msg, instrumentInfoDict[msg]);
        }
      });

      //update
      //fecth instrument model
      nats.request(msg + '.get', 'instrument model', {'max':1}, function(response) {
        console.log('location: ' + response);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].model = response;

          itemService.update(msg, instrumentInfoDict[msg]);
          itemService.updateDB(msg, instrumentInfoDict[msg]);
        }
      });

      //update
      //fecth instrument type
      nats.request(msg + '.get', 'instrument type', {'max':1}, function(response) {
        console.log('location: ' + response);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].instrumentType = response;

          itemService.update(msg, instrumentInfoDict[msg]);
          itemService.updateDB(msg, instrumentInfoDict[msg]);
        }
      });

      //TODO
      //MAKE A NOTE OF ALL SUBSCRIPTIONS AND UNSUBSCRIBE ON HEARTBEAT LOSS

      //listen for run state changes
      var sid = nats.subscribe(msg + '.runstate', function(runstate) {
        console.log('RUNSTATE:' + runstate);

        if(instrumentInfoDict[msg])
        {
          console.log('RUNSTATE2:' + runstate);

          //only notify changes
          if(instrumentInfoDict[msg].runState != runstate)
          {
            console.log('RUNSTATE3:' + runstate);
            instrumentInfoDict[msg].runState = runstate;

            itemService.update(msg, instrumentInfoDict[msg]);
            itemService.updateDB(msg, instrumentInfoDict[msg]);

            itemService.requestNotification(instrumentInfoDict[msg], runstate);
          }
        }
      });

      instrumentSubscriptions[msg].subscriptions.push(sid)

      //listen for real time signals
      var sid = nats.subscribe(msg + '.realtimesignalsstatus', function(response) {
        //console.log(response);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].realtimesignalsstatus = JSON.parse(response);

          //TEMPORARILY STOP NOTIFYING REAL TIME SIGNALS
          //itemService.update(msg, instrumentInfoDict[msg]);
        }
      });

      instrumentSubscriptions[msg].subscriptions.push(sid)

      //listen for instrument events
      var sid = nats.subscribe(msg + '.event', function(s) {
        console.log('event:' + s);

        if(instrumentInfoDict[msg])
        {
          itemService.requestNotification(instrumentInfoDict[msg], 'event:' + s);
        }
      });

      instrumentSubscriptions[msg].subscriptions.push(sid)

      //listen for instrument errors - syslog
      var sid = nats.subscribe(msg + '.error', function(s) {
        console.log('error:' + s);

        if(instrumentInfoDict[msg])
        {
          itemService.requestNotification(instrumentInfoDict[msg], 'log:' + s);
        }
      });

      instrumentSubscriptions[msg].subscriptions.push(sid)

      //listen for instrument procedure status as json
      var sid = nats.subscribe(msg + '.procedurestatus', function(s) {
        console.log('procedurestatus:' + s);

        if(instrumentInfoDict[msg])
        {
          instrumentInfoDict[msg].procedurestatus = JSON.parse(s);
          //itemService.requestNotification(instrumentInfoDict[msg], 'log:' + s);
        }
      });

      instrumentSubscriptions[msg].subscriptions.push(sid)
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

        if( (now - instrumentAdvertisementDict[mac]) > 4000)
        {
          //remove stale advertisement
          console.log('removing stale heartbeat:' + mac);

          delete instrumentAdvertisementDict[mac];
          delete instrumentInfoDict[mac];

          //for(var index in instrumentSubscriptions[mac].subscriptions)
          //{
          //  nats.unsubscribe(instrumentSubscriptions[mac].subscriptions[index])
          //}

          instrumentSubscriptions[mac].subscriptions.forEach(function(sid)
          {
            nats.unsubscribe(sid)
          });

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
