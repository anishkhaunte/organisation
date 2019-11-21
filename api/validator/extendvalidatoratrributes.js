module.exports.nonEmpty = function(validator , attribute_key) {
    validator.attributes[attribute_key] = function(instance, schema, options, ctx) {
        if (typeof instance !== 'string' || !schema.nonEmpty)
            return null;
        instance = instance.trim();
        var minLength = schema.minLength || 1;

        if (instance.length < minLength) {
            if(schema.minLength)
                return "does not meet minimum length of " + minLength;
            else
                return "is empty";
        }
    };
};

module.exports.number = function(validator , attribute_key) {
    validator.types.number = function testNumber (instance) {
        instance = parseInt(instance);
        return !isNaN(instance);
    };
};


var custom_attributes = module.custom_attributes = {
    "nonEmpty":module.exports.nonEmpty,
    "number":module.exports.number
};

module.exports.extend_attributes = function(validator){
    var attribute_keys = Object.keys(custom_attributes);

    attribute_keys.forEach(function(attribute_key){
        if(!custom_attributes.hasOwnProperty(attribute_key))
            return;
        var attribute_fn = custom_attributes[attribute_key];
        if(attribute_fn && typeof attribute_fn === "function")
            return attribute_fn(validator , attribute_key);
    });
};