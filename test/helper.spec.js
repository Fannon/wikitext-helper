'use strict';

const wikitext = require('../src/');
const expect = require('chai').expect;

describe('wikitext-js helper', function() {

    it('escapes wikitext values', function() {
        expect(wikitext.escape('Something|With|Pipes')).to.equal('Something&#124;With&#124;Pipes');
    });
});
