'use strict';
const experiments = require('./experiments');
const userSettings = require('./userSettings');
const deviceTokens = require('./deviceTokens');
const instrumentManager = require('./instrumentManager');
const item = require('./item');
const authentication = require('./authentication');
const user = require('./user');

module.exports = function() {
  const app = this;


  app.configure(authentication);
  app.configure(user);
  app.configure(instrumentManager);
  app.configure(item);
  app.configure(deviceTokens);
  app.configure(userSettings);
  app.configure(experiments);
};
