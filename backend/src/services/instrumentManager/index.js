'use strict';

const hooks = require('./hooks');

var instrumentInfo = {};

var NATS = require('nats');
var nats = NATS.connect();

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(id, params) {
    //console.log(id);
    //console.log(params);
    //console.log(params.query.get);
    var answer = "UNKNOWN";
    switch(params.query.get){
      case 'LOCATION':
        answer = "LAB";
        break;
      default:
        break;
    }
    return Promise.resolve({
      id,
      text: answer//`A new message with ID: ${id}!`
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
  app.use('/instrumentManagers', new Service());

  // Get our initialize service to that we can bind hooks
  const instrumentManagerService = app.service('/instrumentManagers');

  // Set up our before hooks
  instrumentManagerService.before(hooks.before);

  // Set up our after hooks
  instrumentManagerService.after(hooks.after);
};

module.exports.Service = Service;
