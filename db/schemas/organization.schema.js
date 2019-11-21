
'use strict';


function loadSchema(Sequelize,DataTypes){

    var organization = {
        '_id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        'name':{
            type: DataTypes.STRING,
            unique:{
                msg: 'The company name is already in use'
            },
            allowNull:false
        },
        'createdAt': { 
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at' 
        },
        'updatedAt': { 
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at' 
        }
    };
    Sequelize.define('Organizations',organization,{freezeTableName:true, timestamps:false, underscored:true});
    //Organization.belongsTo(Sequelize.models.Organizations, {targetKey:'_id',foreignKey: 'organization_id'});
    
}
module.exports = loadSchema;
  
  