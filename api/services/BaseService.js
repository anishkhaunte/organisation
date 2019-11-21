var Promise = require('bluebird');
var Model = appGlobals.dbModels;

function BaseService (){

    this.parseJSON = function(string) {
        try {
            return JSON.parse(string) || {};
        } catch (e) {
            return string;
        }
    };

    this.toJSON = function(string){
        return this.parseJSON(JSON.stringify(string));
    }

}
module.exports = BaseService;
