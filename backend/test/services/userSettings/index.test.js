'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('userSettings service', function() {
  it('registered the userSettings service', () => {
    assert.ok(app.service('userSettings'));
  });
});
