'use strict';

var fs      = require('fs');
var path    = require('path');
var debug   = require('debug');
var _       = require('lodash');
var convict = require('convict');

function getApplicationRoot(){
    var path0;
    var path1;

    path0 = require.main.filename;

    while (!fs.existsSync(path.join(path0, 'package.json'))) {
        path1 = path.dirname(path0);
        if (path0 === path1) {
            throw new Error('No suitable root directory was found');
        }
        path0 = path1;
    }
    return path0;
}

function ConfigurationManager(options){
    this.options          = options;
    this.schemaDir        = this.options.schemaDir;
    this.options.validate = this.options.validate || {allowed: 'strict'};

    this.debug            = debug(this.options.name || 'configurationmanager');
}

ConfigurationManager.prototype.readSchema = function(dir){
    var self;
    var files;
    var jsonSchema;

    self       = this;
    jsonSchema = {};
    dir        = dir || this.schemaDir;
    files      = fs.readdirSync(dir);

    this.debug("files " , files);
    _
        .chain(files)
        .each(function(file){
            var filePath;
            var propName;
            var stats;
            var json;

            filePath = dir + '/' + file;
            stats    = fs.statSync(filePath);

            if(stats.isDirectory()){
                jsonSchema[file] = self.readSchema(filePath);
            }
            else {
                propName             = path.basename(file, ".json");
                json                 = require(dir + '/' + file);
                if(json.inline){
                    delete json.inline;
                    jsonSchema = _.assign(jsonSchema, json);
                }
                else
                    jsonSchema[propName] = json;
            }
            return jsonSchema;
        })
        .value();

    return jsonSchema;
};

ConfigurationManager.prototype.override = function(){
    var appRoot;
    var override;

    appRoot  = this.config.get('app.root');
    override = this.config.get('app.override');

    if(process.env.NODE_ENV==="test")
        appRoot = appRoot+"/../../"

    this.debug('override file %s', override);

    if( !fs.existsSync(path.resolve(appRoot, override))){
        console.warn("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
        console.warn("X                              X");
        console.warn("X override file does not exist X");
        console.warn("X                              X");
        console.warn("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
        return;
    }

    this.config.set('app.override', path.resolve(appRoot, override));
    this.config.loadFile(this.config.get('app.override'));
};

ConfigurationManager.prototype.load = function(){
    this.schema = this.readSchema();

    this.schema.app.root = {
        'doc'    : 'Application root directory',
        'default': getApplicationRoot(),
        'env'    : 'APP_ROOT',
        'arg'    : 'app-root'
    };

    this.config = convict(this.schema);
    this.override();
    this.config.validate(this.options.validate);
};

ConfigurationManager.prototype.sample = function(){
    var properties;

    this.schema = this.readSchema();
    this.schema.app.root = {
        'doc'    : 'Application root directory',
        'default': getApplicationRoot(),
        'env'    : 'APP_ROOT',
        'arg'    : 'app-root'
    };

    this.config = convict(this.schema);
    properties  = this.config.getProperties();
    properties  = JSON.stringify(properties, null, 4);
    console.log(properties);
};

module.exports.ConfigurationManager = ConfigurationManager;

if(!module.parent){
    var configMgr;
    var properties;
    var action;

    action    = process.argv[2];
    configMgr = new ConfigurationManager({schemaDir : "./configs"});

    if(action === "sample")
        configMgr.sample();

    if(action === "dump"){
        configMgr.load();
        properties  = configMgr.config.getProperties();
        properties  = JSON.stringify(properties, null, 4);
        console.log(properties);
    }
}
