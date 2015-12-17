'use strict';
/* global describe, it */

const wikitext = require('../src/');
const expect = require('chai').expect;

describe('wikitext-js special function', function() {
    'use strict';

    const mockSparqlRow = {
        "c": {
            "type": "uri",
            "value": "http://www.wikidata.org/entity/Q238"
        },
        "label_de": {
            "xml:lang": "de",
            "type": "literal",
            "value": "San Marino"
        },
        "label_en": {
            "xml:lang": "en",
            "type": "literal",
            "value": "San Marino"
        }
    };

    it('converts a SPARQL result row to a mediawiki template', function() {
        let result = wikitext.sparqlRowToTemplate('Country', mockSparqlRow);
        expect(result).to.be.a('string');
        expect(result).to.include('label_de=San Marino');
    });

    it('converts a SPARQL result row with a custom naming map to a mediawiki template', function() {
        let namingMap = {
            'label_de': 'Label de',
            'label_en': 'Label en'
        };
        let result = wikitext.sparqlRowToTemplate('Country', mockSparqlRow, namingMap);
        expect(result).to.be.a('string');
        expect(result).to.include('Label de=San Marino');
        expect(result).to.not.include('c=');
    });

});
