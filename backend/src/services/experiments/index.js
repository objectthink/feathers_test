'use strict';

const hooks = require('./hooks');

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
};

module.exports.Service = Service;
