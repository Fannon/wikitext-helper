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

    setSettings(customSettings) {
        this.settings = Wikitext.merge(this.settings, customSettings);
    }

    //////////////////////////////////////////
    // HELPER FUNCTIONS                     //
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
