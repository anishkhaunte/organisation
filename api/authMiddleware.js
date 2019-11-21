var jwt = require('jsonwebtoken');
var _   = require('lodash');
var phoneReg     = /^\+?\d+$/;
var emailReg     = /^[a-z0-9][a-z0-9._]+\@[a-z0-9.-]+$/;
// var userIdReg     = /^\+?\d+$/;
// var tenantIdReg     = /^\+?\d+$/;

var jwtsecret = config.get('app').jwtsecret;
var ignoreList = config.get('authignore').ignorelist;
var LoginService = require('../api/services/LoginService.js');

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
        return LoginService.getInst().isValid(token_header).then(function(resolve){
            console.log("Token verified.");
            if ((!decoded || (!(decoded.phoneNo && decoded.phoneNo.length) && !(decoded.email && decoded.userId && decoded.tenantId)))
                 && (typeof decoded.isForSelfcare === 'undefined')) {
                if (decoded.token) {
                    if ((decoded.token.startswith('0') || decoded.token.startswith('+91')) && decoded.token.indexOf('@') === -1) {
                        //considered as phone no. Works with Indian numbers only for now
                        decoded.phoneNo = decoded.token.trim();
                    } else {
                        //cannot extract too many info from token...
                        decoded.email = decoded.token.trim();
                    }
                } else {
                    console.log('Invalid jwt', req.headers);
                    return res.sendStatus(401);
                }
            }
            if (decoded.phoneNo) {
                decoded.phoneNo = decoded.phoneNo.trim();
                decoded.phoneNo = decoded.phoneNo.replace(/^0+/, '');
                decoded.phoneNo = decoded.phoneNo.replace(/^\+91/, '');
                decoded.userId = decoded.userId.trim();
                if (!phoneReg.test(decoded.phoneNo)) {
                    console.log('not a valid phoneNo', req.headers);
                    return res.sendStatus(401);
                }
            } else if (decoded.email && (typeof decoded.isForSelfcare === 'undefined')){
                //check the validity of email...
                decoded.email = decoded.email.trim();
                if (!emailReg.test(decoded.email)){
                    console.log('not a valid email', req.headers);
                    return res.sendStatus(401);
                } else if (!decoded.tenantId) {
                    console.log('missing tenant Id', req.headers);
                    return res.sendStatus(401);
                } else if (!decoded.userId) {
                    console.log('missing user Id', req.headers);
                    return res.sendStatus(401);
                }
            }
            req.authInfo = decoded;
            next();
        },function(reject){
            if(reject && reject.message === 'USERDELETED'){
                return res.status(403).send("Your account has been deleted");
            } else if(reject && reject.message === 'USERDEACTIVATED'){
                return res.status(403).send("Your account has been deactivated");
            } else if(reject && reject.message === 'USERPASSCHANGE'){
                return res.status(403).send("Your password has changed. Please login again.");
            } else if(reject && reject.message === 'ROLECHANGE'){
                return res.status(403).send("Your access has changed. Please login again.");
            }
            else {
                console.log("Invalid Token.");
                return res.sendStatus(401);
            }
        });
    };
};
