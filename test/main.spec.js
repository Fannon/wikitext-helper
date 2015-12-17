'use strict';
/* global describe, it */

const wikitext = require('../src/');
const expect = require('chai').expect;

describe('wikitext helper', function() {
    'use strict';

    it('creates single-line wikitext params', function() {
        let obj = {
            param1: true,
            param2: 'param2 value'
        };
        let result = wikitext.params(obj);
        expect(result).to.be.a('string');
        expect(result).to.include('|param1|');
        expect(result).to.include('|param2=param2 value');
    });

    it('creates multi-line wikitext params', function() {
        let obj = {
            param1: true,
            param2: 'param2 value'
        };
        let result = wikitext.params(obj, true);
        expect(result).to.be.a('string');
        expect(result).to.include('|param1\n');
        expect(result).to.include('|param2=param2 value\n');
    });

    it('handles array as arraymap params', function() {
        let obj = {
            param1: true,
            param2: 'param2 value',
            param3: ['item1', 'item2', 'item3']
        };
        let result = wikitext.params(obj, true);
        expect(result).to.be.a('string');
        expect(result).to.include('param3=item1;item2;item3');
    });

    it('creates templates', function() {
        let obj = {
            code: 'en',
            label_en: 'England'
        };
        let result = wikitext.template('Country', obj);
        expect(result).to.be.a('string');
        expect(result).to.include('{{Country\n');
        expect(result).to.include('|code=en\n');
        expect(result).to.include('|label_en=England\n');
    });

    it('creates functions', function() {
        let obj = {
            test: 'this',
            that: true
        };
        let result = wikitext.function('set', obj);
        expect(result).to.be.a('string');
        expect(result).to.include('{{set:\n');
        expect(result).to.include('|test=this\n');
        expect(result).to.include('|that\n');
    });


    it('converts object collections to wikitext', function() {

        let collection = [
            '==Some Header==',
            {
                template: 'Country',
                params: {
                    code: 'en',
                    label_en: 'England'
                }
            },
            {
                function: '#set',
                params: {
                    test: 'this',
                    that: true
                }
            }
        ];

        let result = wikitext.convert(collection);
        expect(result).to.be.a('string');
        expect(result).to.include('==Some Header==');
        expect(result).to.include('|test=this\n');
        expect(result).to.include('|that\n');
    });


});
