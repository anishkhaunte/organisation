function loadSchema(Sequelize,DataTypes){

    var relation = {
        
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
    var indexes = [
        {
            fields: ['organization_id', 'parent_id']
        }
    ];
    var Relation = Sequelize.define('Relations',relation,{freezeTableName:true, timestamps:false, underscored:true, indexes:indexes});
    
    Relation.hasMany(Sequelize.models.Relations,{as: 'parents',foreignKey:'organization_id', sourceKey:'parent_id',constraints: false});
    Relation.hasMany(Sequelize.models.Relations,{as: 'kids',foreignKey:'parent_id', sourceKey:'organization_id', constraints: false});    
    Relation.hasMany(Sequelize.models.Relations,{as: 'siblings',foreignKey:'parent_id', sourceKey:'organization_id', constraints: false});    

}
module.exports = loadSchema;
  
