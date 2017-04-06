'use strict';
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
};
