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

    let LB = ' ';
    let indent = '';
    let result = '';

    if (lineBreak) {
        LB = '\n';
        indent = '  ';
    }

    if (obj && typeof obj === 'object') {
        for (let paramKey in obj) {
            let paramValue = obj[paramKey];

            if (typeof paramValue === 'string' || paramValue instanceof String) {
                result += indent + '| ' + paramKey + '=' + this.escape(paramValue) + LB;
            } else if (Array.isArray(paramValue)) {
                paramValue.map((value) => {
                    return exports.escape(value);
                });
                result += indent + '| ' + paramKey + '=' + paramValue.join(exports.settings.arraymapSeparator) + LB;
            } else {
                result += indent + '| ' + paramKey + LB;
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
exports.template = function(name, params, lineBreak) {
    'use strict';

    if (lineBreak !== false) {
        lineBreak = true;
    }

    let LB = '';
    if (lineBreak) { LB = '\n'; }

    if (!params || Object.keys(params).length === 0) {
        return '{{' + name + '}}' + LB;
    }

    let wikitext = '{{' + name + LB;

    wikitext += exports.params(params, lineBreak);

    wikitext += '}}' + LB;

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
exports.function = function(name, params, mainParam, lineBreak) {
    'use strict';

    mainParam = mainParam || '';

    let LB = '';
    if (lineBreak) { LB = '\n'; }

    if (!params && mainParam) {
        return '{{' + name + ':' + mainParam + '}}' + LB;
    }

    let wikitext = '{{' + name + ':' + mainParam + LB;

    wikitext += exports.params(params, lineBreak);

    wikitext += '}}' + LB;

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
            .split(']').join('&#93;')
        ;
    }
    return wikitext;
};
