'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('instrumentMessages service', function() {
  it('registered the instrumentMessages service', () => {
    assert.ok(app.service('instrumentMessages'));
  });
});
