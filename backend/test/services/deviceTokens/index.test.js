'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('deviceTokens service', function() {
  it('registered the deviceTokens service', () => {
    assert.ok(app.service('deviceTokens'));
  });
});
