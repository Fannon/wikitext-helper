'use strict';
/* global describe, it */

const wikitext = require('../src/');
const expect = require('chai').expect;

describe('wikitext-js helper', function() {
    'use strict';

    it('set custom settings', function() {
        let settings = wikitext.setSettings({
            arraymapSeparator: ';'
        });
        expect(settings.arraymapSeparator).to.equal(';');
    });

    it('escapes wikitext values', function() {
        expect(wikitext.escape('Something|With|Pipes')).to.equal('Something&#124;With&#124;Pipes');
    });
});
