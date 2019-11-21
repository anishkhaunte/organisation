var BaseModel = require('./BaseModel');

class RelationModel extends BaseModel {

    constructor(dbMgr, options){
        super(dbMgr, options);
        this.modelName = 'Relations';
    }

}

module.exports = RelationModel;