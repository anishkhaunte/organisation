'use strict';
var debug = require('debug')("OrganizationService : ");
var BaseService = require('./BaseService.js');
var Promise = require('bluebird');
var _ = require('lodash');
var Sequelize = require('sequelize');

var Model = appGlobals.dbModels;
var organizationModelName = "Organizations";
var relationModelName = "Relations";

var pagination = config.get('db').pagination.list;

function OrganizationService() {
    BaseService.call(this);
}


async function processChildren (item, ret, parentId) {
    let organizationDbModels = Model.getModelInstance(organizationModelName);
    let relationDbModels = Model.getModelInstance(relationModelName);
    let allTree = await Promise.map(item, async (currDaughter) => {
        let daughter_org_name = currDaughter.org_name;
        let organization = await (organizationDbModels.create({ 'name': daughter_org_name }));
        let relation = await (relationDbModels.create({ 'organization_id': organization._id, 'organization_name': organization.name, 'parent_id': parentId }));
        if ("daughters" in currDaughter && currDaughter.daughters.length > 0) {
            processChildren(currDaughter.daughters, ret, organization._id);
        }
    });
    return allTree;
}

OrganizationService.prototype.createOrganizationTree = (payload) => {
    var organizationDbModels = Model.getModelInstance(organizationModelName);
    var self = this;
    var all = [];
    let organization_data = {
        name: payload.org_name
    };
    return organizationDbModels.create(organization_data).then((organization) => {
        if (payload.daughters.length > 0)
            return Promise.all([processChildren.call(self, payload.daughters, all, organization._id)]); //TODO: work on response
        else return organization;
    }).then(() => {
        return Promise.resolve({
            'customCode': 200,
            'status': 'Organization tree created successfully'
        });
    });

};

OrganizationService.prototype.getOrganizationTree = async (queryParams)=> {
    const Op = Sequelize.Op;
    var offset = parseInt(queryParams.offset) || parseInt(pagination.offset);
    var limit = parseInt(queryParams.limit) || parseInt(pagination.limit);
    var relationDbModel = Model.getModelInstance(relationModelName);
    var organizationDbModels = Model.getModelInstance(organizationModelName);
    var orgInfo = await (organizationDbModels.findOne({ where: { 'name': { [Op.iLike]: queryParams.organization_name } } }));

    if(!orgInfo)
        return Promise.reject({
            'customCode': 400,
            'message': "BADREQUEST",
            'errors': "Organization tree not found."
        });

    var parentsInfo = await (relationDbModel.findAll({
        where: { organization_id: orgInfo._id },
        attributes: ['organization_id'],
        include: [{
            model: relationDbModel.dbMgr.sequelize.models.Relations,
            as: 'parents',
            attributes: ['organization_name'],
            required: true
        }],
        raw: true,
        nest: true
    }));

    var siblingsInfo = await (relationDbModel.findAll({
        where: {
            [Op.and]: [
                { organization_id: orgInfo._id },
                { '$parents->siblings.organization_id$': { [Op.ne]: orgInfo._id } }
            ]
        },
        attributes: ['organization_id'],
        include: [{
            model: relationDbModel.dbMgr.sequelize.models.Relations,
            as: 'parents',
            attributes: ['organization_name'],
            required: true,
            include: [{
                model: relationDbModel.dbMgr.sequelize.models.Relations,
                as: 'siblings',
                attributes: ['organization_name'],
                required: true
            }],
            raw: true,
            nest: true
        }],
        raw: true,
        nest: true
    }));

    var kidsInfo = await (relationDbModel.findAll({
        where: { organization_id: orgInfo._id },
        attributes: ['organization_id'],
        include: [{
            model: relationDbModel.dbMgr.sequelize.models.Relations,
            as: 'kids',
            attributes: ['organization_name'],
            required: true
        }],
        raw: true,
        nest: true
    }));

    let all = [];

    if (parentsInfo.length > 0)
        parentsInfo.forEach(parentObj => {
            parentObj.parents.relationship_type = 'parent';
            all.push(parentObj.parents);
        });

    if (kidsInfo.length > 0)
        kidsInfo.forEach(kidObj => {
            kidObj.kids.relationship_type = 'kids';
            all.push(kidObj.kids);
        });

    if (siblingsInfo.length > 0)
        siblingsInfo.map((siblingObj) => {
            siblingObj.parents.siblings.relationship_type = 'sister';
            all.push(siblingObj.parents.siblings);
        });

    all.sort((orgObj1, orgObj2) => {
        var orgNameA = orgObj1.organization_name.toUpperCase();
        var orgNameB = orgObj2.organization_name.toUpperCase();
        if (orgNameA < orgNameB) return -1;
        if (orgNameA > orgNameB) return 1;
        return 0;
    });

    let totalCount = _.size(all);
    let moreAvailable = (offset + limit) < (all.length) ? true : false;
    let paginatedOrganizations = all.splice(offset, limit + 1);

    return {
        totalCount: totalCount,
        moreAvailable: moreAvailable,
        organizations: paginatedOrganizations
    };
};


module.exports = {
    getInst:  ()=> {
        return new OrganizationService();
    }
};
