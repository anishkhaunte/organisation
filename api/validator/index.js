/*global AppLogger*/
var fs        = require('fs'),
    path      = require('path'),
    _         = require("lodash"),
    debug     = require("debug")("Validator");
    allmodels = {};
    custValidator = require('./customvalidator.js');

//	@moduleextend Validator ( module conformant )

//	@moduleextend Validator
//	extends Validator.prototype.types ( module non-conformant )
var AJV        = require("ajv");
var ajv        = new AJV({allErrors:true, jsonPointers: true});
require('ajv-errors')(ajv);

function loadModels() {
    fs.readdirSync(path.join(__dirname, 'models')).forEach(function(file) {
        var models = require('./models/' + file);
        for (var m in models) {
            if (models.hasOwnProperty(m)) {
                allmodels[m] = models[m];
            }
        }
    });
}

function validateSchemaByType(modelschema, schema) {
    var schemaTypes = ["object", "array", "number", "string", "boolean"];
    var data = {};
    var referencedSchema;
    if (modelschema.properties[schema] && schemaTypes.indexOf(modelschema.properties[schema].type) === -1) {
        referencedSchema = modelschema.properties[schema].type;
        if (!data.definitions) data.definitions = {};
        data.id = modelschema.id;
        delete modelschema.id;
        delete modelschema.additionalProperties;
        data.definitions[schema] = modelschema;
        if (!data.oneOf) data.oneOf = [];
        data.oneOf.push({
            "$ref": "#/definitions/" + schema
        });

        data.definitions[schema].properties[schema].properties = allmodels[referencedSchema].properties;
        data.definitions[schema].properties[schema].type = allmodels[referencedSchema].type;
        data.definitions[schema].properties[schema].required = allmodels[referencedSchema].required;
        delete data.definitions[schema].required;
    } else if (modelschema.properties[schema] && modelschema.properties[schema].type === "array") {
        referencedSchema = modelschema.properties[schema].items.$ref;
        data = modelschema;
        data.properties[schema].items = allmodels[referencedSchema].properties;
        data.properties[schema].items.required = allmodels[referencedSchema].required;
        delete data.additionalProperties;
    }
    console.log(JSON.stringify(data))
    return data;
}

function validator(value, schema) {
    var modelSchema = _.cloneDeep(allmodels[schema]);
    var updatedSchema = validateSchemaByType(modelSchema, schema);
    var val = ajv.compile(updatedSchema);
    value = _.omitBy(value, _.isNil);
    var valid = val(value) && ajv.validate(modelSchema, value);
    
    if (!valid) {
        return {errors: val.errors || ajv.errors};
    } else {
        return ajv.validate(modelSchema, value);
    }
}

function getParamSchemaAndValue(req, param) {
    var schemaAndValue = [];
    var paramtype;
    switch (param.paramType) {
        case "path":
            paramtype = "params";
            schemaAndValue.push(req[paramtype][param.name]);
            schemaAndValue.push(param);
            break;
        case "query":
            paramtype = "query";
            schemaAndValue.push(req[paramtype][param.name]);
            schemaAndValue.push(param);
            break;
        case "header":
            paramtype = "headers";
            schemaAndValue.push(req[paramtype][param.name]);
            schemaAndValue.push(param);
            break;
        case "body":
            if (param.name === 'body' || param.name === '') {
                schemaAndValue.push(req.body);
            } else {
                schemaAndValue.push(req.body[param.name]);
            }

            if (allmodels[param.type]) {
                schemaAndValue.push(param.type);
            } else {
                schemaAndValue.push(param);
            }
            break;
        case "form":
            schemaAndValue.push(req.body[param.name]);
            schemaAndValue.push(param);
            break;
    }
    return schemaAndValue;
}

function errorHandler(req, res, errors) {
    var errorz = _.map(errors, error => {
        if (error && error.dataPath.length > 0) {
            error.dataPath = error.dataPath.split("/")[1];
        }

        return {
            property: error.dataPath || error.property,
            message: error.dataPath + " " + error.message
        };
    });
    var log = {
        resource: req.resource || req.url,
        action: req.action || req.method,
        error: errorz
    };
    debug('Validation errors', log);

    res.status(412).send({
        "errors": [{
            "msg": "Validation errors/ Invalid arguments",
            "code": 412,
            "error": errorz
        }]
    });
}

function validate(schema, req, res, next) {
    req.schemaParams = schema.parameters;
    var errors = [];
    if (!(schema.parameters && schema.parameters.length > 0)) {
        next();
        return;
    }
    schema.parameters.forEach(function(p) {
        if (p.paramType.trim() === 'body' || p.paramType.trim() === '') { // validate only body
            if(p.isCustValidator)
                custValidator.process(req, res);
            var schemaAndValue = getParamSchemaAndValue(req, p);
            var result = validator(schemaAndValue[0], schemaAndValue[1]);
            errors.push.apply(errors, result.errors);
        }
    });
    if (errors && errors.length > 0) {
        errorHandler(req, res, errors);
        debug("Errors: ", errors);
        return false;
    }

    next();
}

function getValidator(schema) {
    return function(req, res, next) {
        validate(schema, req, res, next);
    };
}

loadModels();

module.exports = {
    models: allmodels,
    getValidator: getValidator,
    validate: validator
};
