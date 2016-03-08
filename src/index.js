//////////////////////////////////////////
// Variables                            //
//////////////////////////////////////////

/** Default settings */
exports.settings = {
    arraymapSeparator: ';',
    wikitextIndent: '',
    wikitextLinebreak: '\n'
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
// BASIC FUNCTIONS                      //
//////////////////////////////////////////

exports.params = function(obj, lineBreak, noEscape) {
    'use strict';

    let result = '';

    let LB = '';
    let indent = '';

    if (lineBreak) {
        LB = exports.settings.wikitextLinebreak;
        indent = exports.settings.wikitextIndent;
    }

    if (obj && typeof obj === 'object') {
        for (let paramKey in obj) {
            let paramValue = obj[paramKey];

            if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
                if (typeof paramValue === 'string' || paramValue instanceof String) {
                    let val = this.escape(paramValue);
                    if (noEscape) {
                        val = paramValue;
                    }
                    result += indent + '|' + paramKey + '=' + val + LB;
                } else if (Array.isArray(paramValue)) {
                    paramValue.map((value) => {
                        if (noEscape) {
                            return value;
                        } else {
                            return exports.escape(value);
                        }
                    });
                    result += indent + '|' + paramKey + '=' + paramValue.join(exports.settings.arraymapSeparator) + LB;
                } else {
                    result += indent + '|' + paramKey + LB;
                }
            }
        }
    }

    return result;
};


//////////////////////////////////////////
// FUNCTIONS                            //
//////////////////////////////////////////

/**
 * Converts an object to a wikitext template
 *
 * @param {string}      name    name of the template
 * @param {object}      params
 *
 * @returns {string}    wikitext
 */
exports.template = function(name, params, lineBreak, noEscape) {
    'use strict';

    let LB = '';
    if (lineBreak) {
        LB = exports.settings.wikitextLinebreak;
    }

    if (typeof name === 'object' && name.template) {
        params = name.params || {};
        name = name.template;
    }

    if (!params || Object.keys(params).length === 0) {
        return '{{' + name + '}}' + LB;
    }

    let wikitext = '{{' + name + LB;

    wikitext += exports.params(params, lineBreak, noEscape);

    wikitext += '}}' + LB;

    return wikitext;
};

/**
 * Converts an object to a MediaWiki parser function call
 * TODO: Make first param always mainParam?
 *
 * @param {string}      name    name of the function
 * @param {object}      params
 *
 * @returns {string}    wikitext
 */
exports.function = function(name, params, mainParam, lineBreak, noEscape) {
    'use strict';

    mainParam = mainParam || '';

    let LB = '';
    if (lineBreak) {
        LB = exports.settings.wikitextLinebreak;
    }

    if (typeof name === 'object' && name.function) {
        params = name.params || {};
        name = name.function;
    }

    if (!params && mainParam) {
        return '{{' + name + ':' + mainParam + '}}' + LB;
    }

    let wikitext = '{{' + name + ':' + mainParam + LB;

    wikitext += exports.params(params, lineBreak, noEscape);

    wikitext += '}}' + LB;

    return wikitext;
};

/**
 * Very simple and naive wikitext to data structure parser
 * Does only detect templates and arbitrary wikitext
 * No functions, no nesting!
 *
 * TODO: Rewrite this using a true parser? e.g. https://github.com/pegjs/pegjs
 * TODO: Handle nested {{, by counting all {{ after {{ and ignore the same amount of }} until the next cut
 *
 * @param wikitext
 * @returns {{}}
 */
exports.wikitextToCollection = function(wikitext) {
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
exports.collectionToWikitext = function(collection, noEscape) {
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
// SPECIAL FUNCTIONS                    //
//////////////////////////////////////////


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

    if (!row || !templateName) {
        return '';
    }

    let obj = exports.sparqlRowToObj(row, nameMap);

    return exports.template(templateName, obj);
};

/**
 * This converts a SPARQL JSON Result row (response.results.bindings) to an object
 *
 * @param row
 * @param [nameMap]
 *
 * @returns {string}
 */
exports.sparqlRowToObj = function(row, nameMap) {
    'use strict';

    if (!row) {
        return {};
    }

    let obj = {};

    if (nameMap && typeof nameMap === 'object') {
        for (let paramName in nameMap) {
            let paramLabel = nameMap[paramName];
            if (row[paramName] && row[paramName].value) {
                obj[paramLabel] = row[paramName].value;
            }
        }
    } else {
        for (let paramName in row) {
            if (row[paramName].value) {
                obj[paramName] = row[paramName].value;
            }
        }
    }

    return obj;
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
    'use strict';

    if (wikitext && wikitext.split) {
        wikitext = wikitext
            .split('|').join('&#124;')
            .split('[').join('&#91;')
            .split(']').join('&#93;');
    }
    return wikitext;
};
