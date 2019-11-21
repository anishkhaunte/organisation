'use strict';
var jws = require('jws');
var algo = 'HS256';

module.exports = {
    jwtsign : function(payload, secretOrPrivateKey, options){
        options = options || {};
        var header = {
            typ: 'JWT',
            alg: options.algorithm || algo
        };
        payload.iat = Math.round(Date.now() / 1000);
        payload.rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        if (options.expiresInMinutes) {
            var ms = options.expiresInMinutes * 60;
            payload.exp = payload.iat + ms;
        }

        if (options.issuer)
            payload.iss = options.issuer;

        if (options.subject)
            payload.sub = options.subject;

        var signed = jws.sign({
            header: header,
            payload: payload,
            secret: secretOrPrivateKey
        });
        return signed;
    },
    jwtdecode : function(payload, options){
        options = options || {};		
        var signed = jws.decode(payload);
        return signed;
    }
}
