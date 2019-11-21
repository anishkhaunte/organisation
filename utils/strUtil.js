var _ = require('lodash');

exports.extractHash = function (shortendUrl = '') {
    if (shortendUrl.split("?").length > 1 && shortendUrl.split("?")[1].split("&")[0].split("=")[1].length > 1)
        return shortendUrl.split("?")[1].split("&")[0].split("=")[1];

    return shortendUrl;
};

exports.extractDomain = function(email){
    return email.substring(email.lastIndexOf("@") +1);
};

exports.extractUserName = function(email){
    return email.substring(0, email.lastIndexOf("@"));
};