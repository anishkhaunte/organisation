'use strict';
var fs = require('fs');

var models;

models = {};

module.exports.getModelInstance = function(name){
    return models[name];
};


function addAllListeners(path, loadFilesInRoot, dbMgr) {
    loadFilesInRoot = (typeof loadFilesInRoot === 'undefined') ? true : loadFilesInRoot;

    var files;

    files = fs.readdirSync(path);

    files.forEach(function (file) {
        if (['.','..','.git', 'index.js', 'BaseModel.js'].indexOf(file) > -1) return;
        var newpath = [path, file].join('/');
        var pathStat;
        pathStat = fs.statSync(newpath);

        if (pathStat.isFile() && file.substr(-3) === '.js') {
            if (loadFilesInRoot) {
                var cModel = new (require("./"+file))(dbMgr);
                models[cModel.modelName] = cModel;
            }
        } else if (pathStat.isDirectory()) {
            addAllListeners(newpath, true, dbMgr);
        }
    });
}


module.exports.init  = function(dbMgr){
    var path = __dirname;
    addAllListeners(path, true, dbMgr);
};
