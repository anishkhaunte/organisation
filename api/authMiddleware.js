var jwt = require('jsonwebtoken');
var _   = require('lodash');
var jwtsecret = config.get('app').jwtsecret;
var ignoreList = config.get('authignore').ignorelist;

module.exports = function() {
    return function(req, res, next) {
        var token_header, token_parts, decoded;

        try {
            token_header = req.headers.Authorization || req.headers.authorization;
            token_parts = token_header.split(' ');
            decoded = jwt.verify(token_parts[token_parts.length -1], jwtsecret);
        } catch (e) {
            try {
                // Skipping for Token request
                var reqUrl = req.url.split('?')[0];
                if( _.find(ignoreList.equals, (o)=> (o)===reqUrl ) || _.find(ignoreList.startswith,(o)=>reqUrl.indexOf(o)===0) ){
                    return next();
                }else{
                    console.log('Authentication failed for headers1', req.headers);
                    
                    return res.sendStatus(401);
                }
            } catch (e) {
                console.log('Authentication failed for headers', req.headers);

                return res.sendStatus(401);
            }
            
        }
        
    };
};
