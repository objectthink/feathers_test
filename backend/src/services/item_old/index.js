'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

var instrumentInfo = {};

module.exports = function(){

  /////NATS TEST
  var NATS = require('nats');
  var nats = NATS.connect();

  // Simple Publisher
  nats.publish('foo', 'Hello World!');

  // Simple Subscriber
  nats.subscribe('heartbeat', function(msg) {

    if( !(msg in instrumentInfo))
    {
      instrumentInfo[msg] = {
        mac:msg,
        serialnumber:"serialnumber",
        location:"location"
      };

      var item = itemService.create({
        mac:msg,
        serialnumber:"serialnumber",
        location:"location"
      });

      var instrumentManagerService = app.service('/instrumentManagers');
      instrumentManagerService.get(msg, {query:{"get":"LOCATION"}}).then(
        answer => {
          console.log('go this from service:');
          console.log(answer);

        });//console.log(answer.text))

    }
  });

//////////////

  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'items.db'),
    autoload: true
  });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/items', service(options));

  // Get our initialize service to that we can bind hooks
  const itemService = app.service('/items');

  // Set up our before hooks
  itemService.before(hooks.before);

  // Set up our after hooks
  itemService.after(hooks.after);
};
