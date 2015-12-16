'use strict';
/* global describe, it */

const wikitext = require('../src/');
const expect = require('chai').expect;

describe('wikitext helper', function() {
    'use strict';


    it('converts function objects', function() {
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

    it('converts template objects', function() {
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
