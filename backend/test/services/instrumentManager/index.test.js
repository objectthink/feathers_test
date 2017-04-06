'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('instrumentManager service', function() {
  it('registered the instrumentManagers service', () => {
    assert.ok(app.service('instrumentManagers'));
  });
});
