var _ = require("lodash");
var debug = require("debug")("serviceHandler: ");

function errorHandler(err, req, res){
    var errorResponse = _.pick(err,["customCode", "message", "appCode", "errors"]);
    console.log("Error %s -> %s", req.originalUrl, JSON.stringify(errorResponse));
    res.header(err.headers || {});
    res.status(err.customCode || 500).send(errorResponse);
}

function serviceHandler(req, res, serviceP) {
    serviceP.then(function(body){
        debug("body info: " + ((typeof body === "object") ? JSON.stringify(body) : body ));
        body = _.isArray(body)? body : (_.isEmpty(body) ? {} : body);
        if(body.logintoken){
            res.status(200).send({"status":"ok"}); // InfoSEC requirement not to sent jwt while logout just return 200.
        }else{
            res.status(200).send(body);
        }
    }).catch(function(e){
        console.log(e);
        return errorHandler(e, req, res);
    });
}

module.exports.serviceHandler = serviceHandler;
module.exports.errorHandler = errorHandler;
