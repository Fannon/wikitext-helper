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
// BASIC FUNCTIONS                      //
//////////////////////////////////////////

exports.params = function(obj, lineBreak) {
    'use strict';

    let LB = '';
    let wikitext = '';

    if (lineBreak) {
        LB = '\n';
    }

    if (obj && typeof obj === 'object') {
        for (let paramKey in obj) {
            let paramValue = obj[paramKey];
            if (typeof paramValue === 'string' || paramValue instanceof String) {
                wikitext += '|' + paramKey + '=' + this.escape(paramValue) + LB;
            } else if (Array.isArray(paramValue)) {
                paramValue.map((value) => {
                    return exports.escape(value);
                });
                wikitext += '|' + paramKey + '=' + paramValue.join(exports.settings.arraymapSeparator) + LB;
            } else {
                wikitext += '|' + paramKey + LB;
            }
        }
    }

    return wikitext;
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
exports.template = function(name, params) {
    'use strict';

    if (!params || Object.keys(params).length === 0) {
        return '{{' + name + '}}\n';
    }

    let wikitext = '{{' + name + '\n';

    wikitext += exports.params(params, true);

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
exports.function = function(name, params, mainParam) {
    'use strict';

    mainParam = mainParam || '';

    if (!params && mainParam) {
        return '{{' + name + ':' + mainParam + '}}\n';
    }

    let wikitext = '{{' + name + ':' + mainParam + '\n';

    wikitext += exports.params(params, true);

    wikitext += '}}\n';

    return wikitext;
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
exports.convert = function(collection) {
    'use strict';

    let wikitext = '';

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

    if (!templateName || !row) {
        return '';
    }

    let params = {};

    if (nameMap && typeof nameMap === 'object') {
        for (let paramName in nameMap) {
            let paramLabel = nameMap[paramName];
            if (row[paramName] && row[paramName].value) {
                params[paramLabel] = row[paramName].value;
            }
        }
    } else {
        for (let paramName in row) {
            if (row[paramName].value) {
                params[paramName] = row[paramName].value;
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
    'use strict';

    if (wikitext && wikitext.split) {
        wikitext = wikitext
            .split('|').join('&#124;')
            .split('[').join('&#91;')
            .split(']').join('&#93;')
        ;
    }
    return wikitext;
};
