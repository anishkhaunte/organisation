var BaseModel = require('./BaseModel');

class OrganizationModel extends BaseModel {

    constructor(dbMgr, options){
        super(dbMgr, options);
        this.modelName = 'Organizations';
    }

}

module.exports = OrganizationModel;