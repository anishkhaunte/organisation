function loadSchema(Sequelize,DataTypes){

    var relation = {
        '_id': {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        'organization_id':{
            type: DataTypes.INTEGER,
            model:'Organizations',
            key: 'id'
        },
        'organization_name':{
            type: DataTypes.STRING
        },
        'parent_id':{
            type: DataTypes.INTEGER,
            model:'Organizations',
            key: 'id'
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
    var Relation = Sequelize.define('Relations',relation,{freezeTableName:true, timestamps:false, underscored:true});
//    Relation.belongsTo(Sequelize.models.Organizations,{as:'organization'});
//    Relation.belongsTo(Sequelize.models.Organizations,{as:'parent'});
    //Relation.hasMany(Sequelize.models.Organizations,{as:'organization'});
    //Relation.hasMany(Sequelize.models.Organizations,{as:'parent'});
    
    Relation.hasMany(Sequelize.models.Relations,{as: 'parents',foreignKey:'organization_id', sourceKey:'parent_id',constraints: false});
    Relation.hasMany(Sequelize.models.Relations,{as: 'kids',foreignKey:'parent_id', sourceKey:'organization_id', constraints: false});    
    Relation.hasMany(Sequelize.models.Relations,{as: 'siblings',foreignKey:'parent_id', sourceKey:'organization_id', constraints: false});    
    //Relation.hasMany(Sequelize.models.Relations,{foreignKey:'parent'});

}
module.exports = loadSchema;
  
