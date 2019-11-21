"use strict";
module.exports = function (config) {

    //var connectionString = 'mongodb://';
    var connectionString = 'postgres://';
    var credentials;

    if(config.authEnabled === true){
        credentials = encodeURIComponent(config.userName) + ":" + encodeURIComponent(config.password )+"@";
        connectionString += credentials;
    }

    connectionString += config.host;
    connectionString += ':';
    connectionString += config.port;
    connectionString += '/';
    connectionString += config.database;
        
    return connectionString;
};
