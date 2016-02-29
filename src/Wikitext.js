'use strict';

class Wikitext {

    //////////////////////////////////////////
    // CONSTRUCTOR                          //
    //////////////////////////////////////////

    constructor(content, settings) {

        this.collection = [];
        this.wikitext = '';

        /** Default settings */
        settings = {
            arraymapSeparator: ';',
            wikitextIndent: '',
            wikitextLinebreak: '\n'
        };
        if (settings) {
            this.setSettings(settings);
        }

        if (typeof content === 'object') {
            // Create collection from data structure


        } else if (typeof content === 'string') {
            // Create collection from wikitext (needs parsing!)

        }
    }

    //////////////////////////////////////////
    // GETTER & SETTER                      //
    //////////////////////////////////////////

    get version() {
        let packageJson = require('../package.json');
        return packageJson.version;
    }

    get wikitext() {
        return this.collectionToWikitext(this.collection);
    }

    set wikitext(wikitext) {
        this.wikitext = wikitext;
        this.collection = this.wikitextToCollection(wikitext);
    }

    set collection(collection) {
        this.collection = collection;
    }

    get collection() {
        return this.collection;
    }

    setSettings(customSettings) {
        this.settings = Wikitext.merge(this.settings, customSettings);
    }


    //////////////////////////////////////////
    // CORE FUNCTIONS                       //
    //////////////////////////////////////////

    toString() {
        return this.wikitext;
    }

    push(content) {
        if (typeof content === 'object') {
            this.collection.push(content);

        } else if (typeof content === 'string') {
            // Create collection from wikitext (needs parsing!)

        }
    }


    /**
     * Very simple and naive wikitext to data structure parser
     * Does only detect templates and arbitrary wikitext
     * No functions, no nesting!
     *
     * TODO: Rewrite this using a true parser, e.g. https://github.com/pegjs/pegjs
     *
     * @param wikitext
     * @returns {{}}
     */
    wikitextToCollection(wikitext) {
        'use strict';

        let collection = [];

        while (wikitext.indexOf('{{') > -1) {

            let templateStart = wikitext.indexOf('{{');
            let templateEnd = wikitext.indexOf('}}');

            // Add arbitrary wikitext before the template
            let preWikitext = wikitext.slice(0, templateStart).trim();
            if (preWikitext !== '') {
                collection.push(preWikitext);
            }

            // Add the detected Template
            collection.push({
                text: wikitext.slice(templateStart + 2, templateEnd)
            });

            // Remove already parsed wikitext
            wikitext = wikitext.slice(templateEnd + 2);
        }

        if (wikitext.trim() !== '') {
            collection.push(wikitext);
        }

        // Analyze Templates
        for (let el of collection) {

            if (el.text && el.text.indexOf('|') > -1) {

                let templateText = el.text;

                let paramStart = templateText.indexOf('|') || templateText.length;

                // Template name
                let name = templateText.slice(0, paramStart).trim();

                if (name.charAt(0) === '#') {
                    el.function = name.slice(1);
                } else {
                    el.template = name;
                }

                el.params = {};

                templateText = templateText.slice(paramStart + 1);

                // Look for parameters
                while (templateText && templateText.indexOf('|') > -1) {
                    paramStart = templateText.indexOf('|');
                    let paramText = templateText.slice(0, paramStart).trim();
                    let paramArray = paramText.split('=');
                    let paramName = paramArray[0].trim();
                    let paramValue = paramArray[1].trim();
                    el.params[paramName] = paramValue;
                    templateText = templateText.slice(paramStart + 1);
                }

                // Don't forget the last parameter (there's no | to define its ending)
                let paramText = templateText.trim();
                let paramArray = paramText.split('=');
                let paramName = paramArray[0].trim();
                let paramValue = paramArray[1].trim();
                el.params[paramName] = paramValue;

                delete el.text;
            } else if (el.text) {
                // Template without parameters
                el.template = el.text.trim();
                el.params = {};
            }
        }

        return collection;
    };



    /**
     * Converts a collection of wikitext, templates and function calls to a combined wikitext document
     * See the example object for the objCollection object structure
     *
     * @example
     * let example = [
     * '==Pure Wikitext==',
     * {
     *     template: 'Person',
     *     params: {
     *        email: 'rosalind.chan@optique.biz',
     *        phone: '+1 (864) 421-2744'
     *     }
     * },
         * {
     *     function: '#set',
     *     params: {
     *         let1: 1,
     *         let2: 'zwei'
     *     }
     * }];
     *
     * @param {array} collection
     *
     * @returns {string}
     */
    collectionToWikitext(collection, noEscape) {
        'use strict';

        let wikitext = '';

        for (let entry of collection) {

            if (typeof entry === 'string') {
                wikitext += entry + exports.settings.wikitextLinebreak;
            } else if (typeof entry === 'object') {

                if (entry.function) {
                    wikitext += exports.function(entry.function, entry.params, false, true, noEscape);
                } else if (entry.template) {
                    wikitext += exports.template(entry.template, entry.params, true, noEscape);
                }
            }
        }

        return wikitext;
    };

    //////////////////////////////////////////
    // STATIC (HELPER) FUNCTIONS            //
    //////////////////////////////////////////




    //////////////////////////////////////////
    // INTERNAL HELPER FUNCTIONS            //
    //////////////////////////////////////////

    /**
     * Recursively merges two objects
     *
     * @param {object} parent   Parent Object
     * @param {object} child    Child Object; overwrites parent properties
     *
     * @returns {object}        Merged Object
     */
    static merge(parent, child) {
        parent = parent || {};
        child = child || {};
        return Object.assign({}, parent, child);
    }

}

module.exports = Wikitext;
