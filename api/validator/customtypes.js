var regex_lib = {
    email_id : new RegExp("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}"),
    phone_no : new RegExp("^\\+?\\d{10,15}$")
};


var custom_validators =  {
    "email_id" : function(instance){
        return regex_lib.email_id.test(instance);
    },
    "phone_no" : function(instance){
        regex_lib.phone_no.test(instance);
    }
};

module.exports = function(Validator){
    var types = Validator.prototype.types;

    Object.keys(custom_validators).forEach(function(key){
        types[key] = custom_validators[key];
    });
};

module.exports.custom_validators    =   custom_validators;
module.exports.custom_types         =   Object.keys(custom_validators);

