'use strict';

var fs       = require('fs');
var path     = require('path');
var _        = require('lodash');
var debug    = require('debug');
var Promise = require('bluebird');
var Sequelize = require('sequelize');
var connString = require("./postgresConnectionString.js");

class DBManager {

    constructor(config){
        this.name     = config.name || 'dbmanager';
        this.debug    = debug('dbmanager');
        this.config   = config;
        this.sequelize = Sequelize;
    }

    prepareDBURL(){
        let db = config.get("db");
        //in case want to run it against testcase see bootstrap.js
        if(this.config.dbName) db.database = this.config.dbName;
        return connString(db);
    }

    setOperatorAliases(){
        const Op = Sequelize.Op;
        const operatorsAliases = {
            $eq: Op.eq,
            $ne: Op.ne,
            $gte: Op.gte,
            $gt: Op.gt,
            $lte: Op.lte,
            $lt: Op.lt,
            $not: Op.not,
            $in: Op.in
        };
        return operatorsAliases;
    }

    loadSchemas(){
        let files;

        this.debug('loading schemas');
        files = fs.readdirSync(path.resolve(__dirname, './schemas'));

        _
        .chain(files)
        .each((file) => {
            if(file.indexOf('.schema.js') === -1){
                return;
            }

            require(path.resolve(__dirname, './schemas/' + file))(this.sequelize, Sequelize);
            this.debug('loaded schema %s' , file);
        })
        .value();
    }

    syncing(){
        return new Promise((resolve, reject) => {
            let options = {};
            this.config.dbName === 'test' ? options.force = true: options.force = false;
            this.sequelize.sync(options).then(()=> resolve());
        });
    }


    init(){
        var self = this;
        return new Promise((resolve, reject) => {
            console.info(this + ' : initialization in progress');
            
            

            var cb = function(error) {
                if(error){
                    console.log("error", error);
                    self.createConnection(cb);
                }   
            };
            this.connection = this.createConnection(cb);
            
            this.loadSchemas();
            this.syncing().then(()=> resolve());
        });
    }

    createConnection(cb){
        let dbURL = this.prepareDBURL();
        let operatorsAliases = this.setOperatorAliases();
        //DBname, username, password, options
        //this.sequelize =  new Sequelize("postgres", "postgres", "admin",{host:"localhost", dialect: "postgres",define: { "createdAt": "createdat","updatedAt": "updatedat"}, operatorAliases: operatorsAliases} );
        //this.sequelize =  new Sequelize('postgres://postgres:admin@db:5432/postgres' );
        this.sequelize = new Sequelize(dbURL,{
            dialect: 'postgres', 
            define: { 
                "createdAt": "createdat",
                "updatedAt": "updatedat"
            },
            operatorAliases: operatorsAliases});
        return this.sequelize;
    }

    getModel(modelName){
        return this.connection.model(modelName);
    }

}

module.exports = DBManager;
