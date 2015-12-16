//////////////////////////////////////////
// Variables                            //
//////////////////////////////////////////

/** Default settings */
exports.settings = {
    arraymapSeparator: ';'
};


//////////////////////////////////////////
// GETTER / SETTER                      //
//////////////////////////////////////////

exports.setSettings = function(settings) {
    exports.settings = settings;
};


//////////////////////////////////////////
// FUNCTIONS                            //
//////////////////////////////////////////

/**
 * Converts a collection of wikitext, templates and function calls to a combined wikitext document
 * See the example object for the objCollection object structure
 *
 * @example
 * var example = [
 * '==Pure Wikitext==',
 * {
 *     name: 'Person',
 *     template: {
 *        email: 'rosalind.chan@optique.biz',
 *        phone: '+1 (864) 421-2744'
 *     }
 * },
 * {
 *     name: '#set',
 *     function: {
 *         var1: 1,
 *         var2: 'zwei'
 *     }
 * }];
 *
 * @param objCollection
 * @returns {string}
 */
exports.arrayToWikitext = function(objCollection) {
    'use strict';

    var wikitext = '';

    for (let entry of objCollection) {

        var obj = objCollection[i];

        if (typeof obj === 'string') {
            wikitext += obj + '\n';
        } else if (typeof obj === 'object' && obj.function) {
            wikitext += exports.objToFunction(obj.name, obj.function);
        } else if (typeof obj === 'object') {
            // If no data is given, asume it's an empty template
            var template = obj.template || {};
            wikitext += exports.objToTemplate(obj.name, template);
        }
    }

    return wikitext;
};


/**
 * Converts an object to a wikitext template
 *
 * @param {string}      name    name of the template
 * @param {object}      obj
 *
 * @returns {string}    wikitext
 */
exports.template = function(name, obj) {
    'use strict';

    if (!obj || Object.keys(obj).length === 0) {
        return '{{' + name + '}}\n'; // No unnecessary linebreaks
    }

    var wikitext = '{{' + name + '\n';

    for (var propertyName in obj) {
        var property = obj[propertyName];

        if (property && typeof property === 'object' && !(property instanceof Array)) {
            // Handle Objects
            console.log('[W] importHelper.objToTemplate() cannot convert objects to template values!');
        } else if (property === null) {
            // Handle properties without value
            wikitext += '|' + propertyName + '\n';
        } else if (Array.isArray(property)) {
            // Handle Arrays
            property = exports.escape(property);
            wikitext += '|' + propertyName + '=' + property.join(exports.settings.arraymapSeparator + ' ') + '\n';
        } else if (property instanceof Boolean) {
            // Handle Booleans
            // TODO: This needs to be adjustable/localizable
            if (property === true) {
                property = 'Yes';
            } else {
                property = 'No';
            }
            wikitext += '|' + propertyName + '=' + exports.escape(property) + '\n';
        } else {
            wikitext += '|' + propertyName + '=' + exports.escape(property) + '\n';
        }
    }

    wikitext += '}}\n';

    return wikitext;
};

/**
 * Converts an object to a MediaWiki parser function call
 *
 * @param {string}      name    name of the function
 * @param {object}      obj
 *
 * @returns {string}    wikitext
 */
exports.function = function(name, obj) {

    var wikitext = '{{' + name + ':\n';

    for (var propertyName in obj) {

        var prop = obj[propertyName];

        if (prop && typeof prop === 'object' && !(obj instanceof Array)) {
            console.error('[W] importHelper.objToFunction() cannot convert objects to function parameters!');
        } else if (prop === true) {
            wikitext += '|' + propertyName + '\n';
        } else if (Array.isArray(prop)) {
            wikitext += '|' + propertyName + '=' + prop.join(exports.settings.arraymapSeparator) + '\n';
        } else {
            wikitext += '|' + propertyName + '=' + prop.toString().trim() + '\n';
        }
    }

    wikitext += '}}\n';

    return wikitext;
};

//////////////////////////////////////////
// HELPER                               //
//////////////////////////////////////////

/**
 * Escapes problematic wikitext characters
 *
 * @param {string}      wikitext
 *
 * @returns {string}
 */
exports.escape = function(wikitext) {
    if (wikitext && wikitext.split) {
        wikitext = wikitext
            .split('|').join('&#124;')
            .split('[').join('&#91;')
            .split(']').join('&#93;')
        ;
    }
    return wikitext;
};

exports.findInCollection = function(collection, name) {

    var results = [];

    for (var i = 0; i < collection.length; i++) {
        var obj = collection[i];
        if (obj.name && obj.name === name) {
            results.push(obj);
        }
    }

    return results;

};
