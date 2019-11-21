/* */
function param(ptype, name, description, type, required, cv, allowableValuesEnum, defaultValue,options) {
    options = options || {};
    var p = {
        "name": name,
        "description": description,
        "type": type,
        "required": required,
        "isCustValidator": cv,
        "defaultValue": defaultValue,
        "default": defaultValue,
        "paramType": ptype
    };
    if (allowableValuesEnum) {
        p.enum = allowableValuesEnum;
    }
    Object.keys(options).forEach(function(key) {
        p[key] = options[key];
    });

    return p;
}
exports.query = exports.q = function(name, description, type, required, cv, allowableValuesEnum, defaultValue, options) {
    return param("query", name, description, type, required, cv, allowableValuesEnum, defaultValue, options);
};

exports.path = function(name, description, type, required, cv, allowableValuesEnum, defaultValue, options) {
    return param("path", name, description, type, required, cv, allowableValuesEnum, defaultValue, options);
};

exports.body = function(name, description, type, required, cv, defaultValue, minLength, options) {
    return param("body", name, description, type, required, cv, null, defaultValue, minLength, options);
};

exports.form = function(name, description, type, required, cv, allowableValuesEnum, defaultValue, options) {
    return param("form", name, description, type, required, cv, allowableValuesEnum, defaultValue, options);
};

exports.header = function(name, description, type, required) {
    var p = param("header", name, description, type, required);
    p.allowMultiple = false;
    return p;
};
