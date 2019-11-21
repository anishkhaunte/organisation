var fs      = require('fs');
var debug   = require("debug");
var Promise = require('bluebird');
var config  = require("../config");
var utils   = require("../utils");
var _       = require('lodash');
var globals = {};

globals.config = function(_config) {
    Object.defineProperty(global, 'config', {
        value: _config,
        writable: true,
        configurable: false,
        enumerable: true
    });
};

globals.appGlobals = function() {
    Object.defineProperty(global, 'appGlobals', {
        value: {},
        writable: true,
        configurable: false,
        enumerable: true
    });
};


let dbConnStatus = function(dbMgr) {
    Object.defineProperty(global, 'dbConnStatus', {
        value: dbMgr,
        writable: true,
        configurable: false,
        enumerable: true
    });
}

globals.dbModels = function() {
    var modelsInst = require('../db/models');
    Object.defineProperty(appGlobals, 'dbModels', {
        value: modelsInst,
        writable: false,
        configurable: false,
        enumerable: true
    });
};
globals.createurls = function(){
    let appconfig = config.get("app");

    let apiport = ":"+appconfig.port;

    if(process.env.NODE_ENV==="production"){
        wsport = "";
        apiport ="";
    };
    let appurl = appconfig.publicUrl || (appconfig.apiProtocol+"://"+appconfig.baseurl+apiport);
    console.log("urls->> ",appurl);
    Object.defineProperty(global, 'APPURL', {
        value: appurl,
        writable: true,
        configurable: false,
        enumerable: true
    });
};


function initiateDataBase(callback) {
    var thatappGlobals = appGlobals;
    var dbMgr = require('../db')
    var dbname = process.env.NODE_ENV === 'test' ? "test" : undefined;
    debug("initiating database");
    return dbMgr.initialize({dbName: dbname})
    .then(function(dbMgr){
        dbConnStatus(dbMgr);
        thatappGlobals.dbModels.init(dbMgr);
        return callback && callback(dbMgr);
    });
}



function prepareGlobalConstants(ignore) {
    if (!debug) debug = require('debug')('bootstrap');

    //global constants load
    var globalConstants = [
        'appGlobals',
        'dbModels',
        'createurls'
    ];

    if (arguments.length !== 0 && ignore) {
        debug('Load Globals');
        globalConstants = globalConstants.filter(function (i) {
            return (ignore.indexOf(i) === -1 );
        });
    }

    globalConstants.forEach(function(constant) {
        if (global.constant) return;
        debug('loading constant', constant);
        globals[constant]();
    });
}

function essentials(conf){
    //so we can enable debug from config
    //require('./bootstrap.debug.js')(conf);
    debug       = require('debug')('bootstrap');
    globals.config(conf);
}

exports.init = function(conf, ignore) {
    conf.errors = require('../errors/');
    essentials(conf)
    prepareGlobalConstants(ignore);
    var initarray = [];
    if(!ignore || ignore.indexOf('dbModels') === -1 ){
        let dbP = initiateDataBase();
        initarray.push(dbP);
    }
    return Promise.all(initarray).then(()=>{});
};


exports.globals = globals;
