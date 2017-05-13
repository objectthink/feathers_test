'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
    this.heartbeats = []
    this.runStateDictionary = {}
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

      //COUCHBASE
      var couchbase = require('couchbase');
      var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
      var bucket = cluster.openBucket('experiments');

      this.bucket = bucket;
  }

  find(params) {
    return Promise.resolve([]);
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
  app.use('/experiments', new Service());

  // Get our initialize service to that we can bind hooks
  const experimentsService = app.service('/experiments');

  // Set up our before hooks
  experimentsService.before(hooks.before);

  // Set up our after hooks
  experimentsService.after(hooks.after);

  /////NATS TEST
  var NATS = require('nats');
  var nats = NATS.connect();

  // Simple Subscriber
  //MSG IS INSTRUMENT ID
  nats.subscribe('heartbeat', function(heartbeat)
  {
    //if( !(experimentsService.heartbeats.includes(heartbeat)))
    if(!(heartbeat in experimentsService.runStateDictionary))
    {
      experimentsService.runStateDictionary[heartbeat] = {runstate:''}

      //listen for run state changes
      var sid = nats.subscribe(heartbeat + '.runstate', function(runstate) {
        if(experimentsService.runStateDictionary[heartbeat].runstate != runstate)
        {
          console.log('experiments:' + runstate)
          experimentsService.runStateDictionary[heartbeat].runstate = runstate

          if(runstate == 'Test')
          {
            console.log('experiments, creating experiment')
          }
        }
        //itemService.update(msg, instrumentInfoDict[msg]);
        //itemService.updateDB(msg, instrumentInfoDict[msg]);

        //itemService.requestNotification(instrumentInfoDict[msg], runstate);
      });

      //listen for real time signals
      var sid = nats.subscribe(heartbeat + '.realtimesignalsstatus', function(response) {
        //console.log(runstate);

        //if we are in the middle of a test write real time signals to database
        if(experimentsService.runStateDictionary[heartbeat].runstate == "Test")
        {
          console.log('writing real time signals to database')
          //instrumentInfoDict[msg].realtimesignalsstatus = response;

          //TEMPORARILY STOP NOTIFYING REAL TIME SIGNALS
          //itemService.update(msg, instrumentInfoDict[msg]);
        }
      });

    }

  });

};

module.exports.Service = Service;
