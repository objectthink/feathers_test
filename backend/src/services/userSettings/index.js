'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'userSettings.db'),
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
  app.use('/userSettings', service(options));

  // Get our initialize service to that we can bind hooks
  const userSettingsService = app.service('/userSettings');

  // Set up our before hooks
  userSettingsService.before(hooks.before);

  // Set up our after hooks
  userSettingsService.after(hooks.after);
};
