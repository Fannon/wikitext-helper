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

exports.setSettings = function(customSettings) {
    'use strict';
    customSettings = customSettings || {};
    for (let settingName in customSettings) {
        exports.settings[settingName] = customSettings[settingName];
    }
    return exports.settings;
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
 *     template: 'Person',
 *     params: {
 *        email: 'rosalind.chan@optique.biz',
 *        phone: '+1 (864) 421-2744'
 *     }
 * },
 * {
 *     function: '#set',
 *     params: {
 *         var1: 1,
 *         var2: 'zwei'
 *     }
 * }];
 *
 * @param {array} collection
 *
 * @returns {string}
 */
exports.convert = function(collection) {
    'use strict';

    var wikitext = '';

    for (let entry of collection) {

        if (typeof entry === 'string') {
            wikitext += entry + '\n';
        } else if (typeof entry === 'object') {

            if (entry.function) {
                wikitext += exports.function(entry.function, entry.params || {});
            } else if (entry.template) {
                wikitext += exports.template(entry.template, entry.params || {});
            }
        }
    }

    return wikitext;
};


/**
 * Converts an object to a wikitext template
 *
 * @param {string}      name    name of the template
 * @param {object}      params
 *
 * @returns {string}    wikitext
 */
exports.template = function(name, params) {
    'use strict';

    if (!params || Object.keys(params).length === 0) {
        return '{{' + name + '}}\n'; // No unnecessary linebreaks
    }

    var wikitext = '{{' + name + '\n';

    for (var propertyName in params) {
        var property = params[propertyName];

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
 * @param {object}      params
 *
 * @returns {string}    wikitext
 */
exports.function = function(name, params) {

    var wikitext = '{{' + name + ':\n';

    for (var propertyName in params) {

        var prop = params[propertyName];

        if (prop && typeof prop === 'object' && !(params instanceof Array)) {
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

/**
 * This converts a SPARQL JSON Result row (response.results.bindings) to a template
 * @param templateName
 * @param row
 * @param [nameMap]
 *
 * @returns {string}
 */
exports.sparqlRowToTemplate = function(templateName, row, nameMap) {
    'use strict';
    
    let params = {};

    if (nameMap && typeof nameMap === 'object') {
        for (let paramName in nameMap) {
            let paramLabel = nameMap[paramName];
            if (row[paramName] && row[paramName].value) {
                params[paramLabel] = row[paramName].value
            }
        }
    } else {
        for (let paramName in row) {
            if (row[paramName].value) {
                params[paramName] = row[paramName].value
            }
        }
    }

    return exports.template(templateName, params);
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
