'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('experiments service', function() {
  it('registered the experiments service', () => {
    assert.ok(app.service('experiments'));
  });
});
