'use strict';

var inherits    = require('util').inherits;

var VError      = require('verror');
var _           = require('lodash');

function parseArgumentsVError(){
    var args;
    var parsed;

    parsed      = {};
    args        = _.toArray(arguments);

    if(_.isPlainObject(args[0])){ //({} , sprintf args)
       parsed.options = args[0];
       parsed.sprintf = _.slice(args,1);
    }
    else if(_.isError(args[0]) || args[0] instanceof VError){ //( err , sprintf args)
        parsed.options          = {};
        parsed.options.cause    = args[0];
        parsed.sprintf          = _.slice(args,1);
    }
    else if(_.isString(args[0])){ // (sprintf args)
        parsed.options  = {};
        parsed.sprintf  = args;
    }
    else{ // invalid case
        console.log(arguments);
        throw new Error("invalid arguments");
    }
    parsed.options.info = parsed.options.info || {};
    parsed.applyArgs    = [parsed.options].concat(parsed.sprintf);

    return parsed;
}

module.exports.makeErrorKlz  = function(name , defaults){

        function ErrorKlz() {
                var parsed;

                defaults    = defaults  || {};
                parsed      =  parseArgumentsVError.apply(null , _.toArray(arguments));

                parsed.options.name = name;
                parsed.options.info = parsed.options.info ||{};
                _.assign(parsed.options.info , defaults);

                this.isRetryable    = parsed.options.isRetryable || false;
                VError.apply(this, parsed.applyArgs);
            }
            inherits(ErrorKlz, VError);

            return ErrorKlz;
};

module.exports.parseArgumentsVError = parseArgumentsVError;
