'use strict';

const hooks = require('./hooks');

var instrumentInfoDict = {};
var instrumentAdvertisementDict = {};

//var instrumentInfoArray = [];

class Service {
  constructor(options) {
    this.options = options || {};
  }

  findX(params) {
    console.log('in find');
    return Promise.resolve([]);
  }

  find(params) {
    //console.log('in find');
    //return Promise.resolve([{id:"1", mac:"0a-1b-3c-4d-5e-6f", serialnumber:"RIODIO", location:"LABORATORY"}]);

    console.log('find!');

    if(params.reset==='true')
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

  get(id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  create(data, params) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

  update(id, data, params) {
    console.log('update item:' + id + ' with:'+ data);
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
  var nats = NATS.connect();

  // Simple Publisher
  nats.publish('foo', 'Hello World!');

  // Simple Subscriber
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
        runState:"Idle"
      };

      itemService.create({
        mac:msg,
        serialnumber:"serialnumber",
        location:"location",
        runState:"Idle"
      });

      //update
      //fecth location
      nats.request(msg + '.get', 'location', {'max':1}, function(response) {
        console.log('location: ' + response);

        instrumentInfoDict[msg] = {
          mac:msg,
          serialnumber:instrumentInfoDict[msg].serialnumber,
          location:response,
          runState:instrumentInfoDict[msg].runState
        };

        itemService.update(
          msg,
          {
            mac:msg,
            serialnumber:instrumentInfoDict[msg].serialnumber,
            location:response,
            runState:instrumentInfoDict[msg].runState
          });
      });

      //fecth serial number
      nats.request(msg + '.get', 'serial number', {'max':1}, function(response) {
        console.log('serial number: ' + response);

        instrumentInfoDict[msg] = {
          mac:msg,
          serialnumber:response,
          location:instrumentInfoDict[msg].location,
          runState:instrumentInfoDict[msg].runState
        };

        itemService.update(
          msg,
          {
            mac:msg,
            serialnumber:response,
            location:instrumentInfoDict[msg].location,
            runState:instrumentInfoDict[msg].runState
          });
      });

      //fecth run state
      nats.request(msg + '.get', 'run state', {'max':1}, function(response) {
        console.log('run state: ' + response);

        instrumentInfoDict[msg] = {
          mac:msg,
          serialnumber:instrumentInfoDict[msg].serialnumber,
          location:instrumentInfoDict[msg].location,
          runState:response
        };

        itemService.update(
          msg,
          {
            mac:msg,
            serialnumber:instrumentInfoDict[msg].serialnumber,
            location:instrumentInfoDict[msg].location,
            runState:response
          });
      });

      nats.subscribe(msg + '.runstate', function(runstate) {
        console.log(runstate);

        instrumentInfoDict[msg] = {
          mac:msg,
          serialnumber:instrumentInfoDict[msg].serialnumber,
          location:instrumentInfoDict[msg].location,
          runState:response
        };

        itemService.update(
          msg,
          {
            mac:msg,
            serialnumber:instrumentInfoDict[msg].serialnumber,
            location:instrumentInfoDict[msg].location,
            runState:runstate
          });
      });

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
