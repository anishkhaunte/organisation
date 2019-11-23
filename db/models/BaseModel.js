'use strict';

var Promise = require('bluebird');
var debug    = require('debug')('basemodel');
var utils    = require("../../utils/");
var pagination = config.get('db').pagination;
var _           = require('lodash');
class BaseModel{

    constructor(dbMgr, options){
        this.utils     = utils;
        this.dbMgr     = dbMgr;
        this.options   = options || {};
        this.debug     = debug('model:' + this.constructor.name);
    }

    getModel(name){
        return new Promise((resolve, reject) =>{
            return resolve(this.dbMgr.getModel(name));
        });
    }

    create(rec, opts){
        opts = opts || {};
        //rec._id = rec._id || utils.generateId(this.modelName);
        return this.getModel(this.modelName)
                .then((model) =>{
                    console.log('REC',rec);
                    return model.create(rec);
                });
    }

    findAll (query){
        return this.getModel(this.modelName)
            .then((model) => {
                return model.findAll(query);
            });
    }

    findOne(query){
        return this.getModel(this.modelName)
            .then((model) => {
                return model.findOne(query);
            });
    }
    
}
module.exports = BaseModel;
