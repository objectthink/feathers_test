'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'deviceTokens.db'),
    autoload: true
  });

/*
  db.removeIndex('deviceToken', function (err) {
  });
*/

  db.ensureIndex(
    { fieldName: 'deviceToken', unique: true },
      function (err)
      {
        console.log(err)
      });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/deviceTokens', service(options));

  // Get our initialize service to that we can bind hooks
  const deviceTokensService = app.service('/deviceTokens');

  // Set up our before hooks
  deviceTokensService.before(hooks.before);

  // Set up our after hooks
  deviceTokensService.after(hooks.after);
};
