'use strict';

var nats;
var heartbeats = [];

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
    this.heartbeats = []
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
      var bucket = cluster.openBucket('syslog');

      this.bucket = bucket
      this.couchbase = couchbase
  }

  find(params) {

    console.log(params.query)

    var q = this.couchbase.N1qlQuery.fromString('select instrument_info.serialnumber, syslog.message, syslog.`when` from `syslog` syslog join `instrument_info` instrument_info on keys syslog.`from` where instrument_info.serialnumber="Halo" order by syslog.`when` desc limit 25');

/*
    this.bucket.query(q, [], function(err, rows){
      console.log(rows)
    })
*/
    console.log('query start')
    var results = this.bucket.query(q)

    console.log('query end')
    console.log(results)

    return Promise.resolve([{name: 'stephen'}, {name: 'ann'}]);
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

    this.bucket.upsert(params.query.id, data, function(err, result)
    {
      console.log('CREATE ERR:' + err)
      console.log('added message CREATE:  ' + data.message)
    });

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
  app.use('/instrumentMessages', new Service());

  // Get our initialize service to that we can bind hooks
  const instrumentMessagesService = app.service('/instrumentMessages');

  // Set up our before hooks
  instrumentMessagesService.before(hooks.before);

  // Set up our after hooks
  instrumentMessagesService.after(hooks.after);

  ////////COUCHBASE

  var couchbase = require('couchbase');
  var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
  var bucket = cluster.openBucket('syslog');

  /*
  bucket.upsert('testdoc', {name:'Frank'}, function(err, result)
  {
    if (err) throw err;

    bucket.get('testdoc', function(err, result)
    {
      if (err) throw err;

      console.log(result.value);

    });
  });
  */

  /////NATS TEST
  var NATS = require('nats');
  nats = NATS.connect();

  // Simple Subscriber
  //MSG IS INSTRUMENT ID
  nats.subscribe('heartbeat', function(heartbeat)
  {
    if( !(heartbeats.includes(heartbeat)))
    {
      console.log(heartbeat);

      heartbeats.push(heartbeat);

      //listen for instrument events
      var sid = nats.subscribe(heartbeat + '.event', function(s)
      {
      });

      //listen for instrument errors
      var sid = nats.subscribe(heartbeat + '.error', function(s)
      {
        // Generate a v1 UUID (time-based)
        const uuidV1 = require('uuid/v1');
        //uuidV1(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a'

        //migrate to use create method
        //bucket.upsert(uuidV1(), {message: s, from: heartbeat, when: new Date() }, function(err, result)
        //{
        //  console.log('added message:  ' + s)
        //});

        instrumentMessagesService.create(
          {
            message: s,
            from: heartbeat,
            when: new Date()
          },
          {
            query: {id: uuidV1()}
          }
        )

      });
    }

  });

};

module.exports.Service = Service;
