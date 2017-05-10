'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('syslog service', function() {
  it('registered the syslogs service', () => {
    assert.ok(app.service('syslogs'));
  });
});
