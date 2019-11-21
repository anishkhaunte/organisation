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

    find(query, qOpts,otherOpts){
        return this.getModel(this.modelName)
                .then((model) =>{
                    if(_.size(_.keys(otherOpts)) === 0)
                        return model.find(query, qOpts);
                    else {
                        if(otherOpts.sortObj.doSort && otherOpts.limitObj.doLimit){
                            return model.find(query, qOpts).sort(otherOpts.sortObj.fields).limit(otherOpts.limitObj.limitValue);
                        } else if(otherOpts.sortObj.doSort){
                            return model.find(query, qOpts).sort(otherOpts.sortObj.fields);
                        } else if(otherOpts.leanObj.doLean){
                            return model.find(query, qOpts).lean();
                        }
                    }
                });
    }

    findPaginate(query, projection, qOpts, whetherCollation,whetherSort, whetherPopulate){
        if (qOpts && !qOpts.offset) {
            qOpts.offset = 0;
        }
        
        if(qOpts && !qOpts.limit){
            qOpts.limit = parseInt(pagination.limit);
        }
        if(qOpts && !qOpts.offset){
            qOpts.offset = parseInt(pagination.offset);
        }
        if(qOpts) {
            qOpts.skip = parseInt(qOpts.offset);
            qOpts.limit = parseInt(qOpts.limit);
        }

        return this.getModel(this.modelName)
            .then((model) => {
                if(_.size(_.keys(whetherSort)) === 0)
                    return model.find(query, projection,qOpts);
                else if(whetherPopulate && whetherPopulate.doPopulate){  
                    if(_.size(_.keys(whetherPopulate.populateLevelOne)) >0 && _.size(_.keys(whetherPopulate.populateLevelTwo)) >0)
                        return model.find(query, projection,qOpts).lean().collation(whetherCollation).sort(whetherSort).populate(whetherPopulate.populateLevelOne).populate(whetherPopulate.populateLevelTwo);
                    else 
                        return model.find(query, projection,qOpts).lean().collation(whetherCollation).sort(whetherSort).populate(whetherPopulate.populateLevelOne);                
                }
                else if(whetherPopulate && whetherPopulate.path) {
                    return model.find(query).populate(whetherPopulate);
                }
                else
                    return model.find(query, projection,qOpts).collation(whetherCollation).sort(whetherSort);

            });
    }

    findOne(query, qOpts){
        return this.getModel(this.modelName)
                .then((model) =>{
                    return model.findOne(query);
                });
    }

    findOneAndPaginate(query, qOpts){
        return this.getModel(this.modelName)
                .then((model) =>{
                    return model.findOne(query, qOpts);
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

    update(matchCnd, updateArgs, opts){
        opts = opts || {};
        if (!updateArgs) {
            return Promise.reject(new Error('updateArgs missing'));
        }

        return this.getModel(this.modelName)
                .then((model) =>{
                    // add modified date to document if it exists in the dbschema
                    if (model.schema.paths.mOn) {
                        if (updateArgs.$set)
                            updateArgs.$set.mOn = new Date();
                        else
                            updateArgs.$set = {"mOn": new Date()};
                    }
                    return model.update(matchCnd, updateArgs, opts);
                }).then(null,(err) =>{
                    return Promise.reject(err);
                });
    }

    findOneAndUpdate(matchCnd, updateArgs, opts){
        opts = opts || {};
        if (!updateArgs) {
            return Promise.reject(new Error('updateArgs missing'));
        }

        return this.getModel(this.modelName)
                .then((model) =>{
                    // add modified date to document if it exists in the dbschema
                    if (model.schema.paths.mOn) {
                        if (updateArgs.$set)
                            updateArgs.$set.mOn = new Date();
                        else
                            updateArgs.$set = {"mOn": new Date()};
                    }
                    return model.findOneAndUpdate(matchCnd, updateArgs, opts);
                }).then(null,(err) =>{
                    return Promise.reject(err);
                });
    }

    count(matchCnd) {
        return this.getModel(this.modelName)
            .then((model) =>{
                return model.count(matchCnd);
            }).then(null,(err) =>{
                return Promise.reject(err);
            });
    }

    remove(matchCnd) {
        return this.getModel(this.modelName)
            .then((model) =>{
                return model.remove(matchCnd);
            }).then(null,(err) =>{
                return Promise.reject(err);
            });
    }

    deleteOne(query) {
        return this.getModel(this.modelName)
            .then((model) =>{
                return model.deleteOne(query)
            }).then(null,(err) =>{
                return Promise.reject(err);
            });
    }

    deleteMany(query, qOpts) {
        return this.getModel(this.modelName)
            .then((model) =>{
                return model.deleteMany(query, qOpts)
            }).then(null,(err) =>{
                return Promise.reject(err);
            });
    }
}
module.exports = BaseModel;
