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


function processChildren(item, ret, parentId) {
    var organizationDbModels = Model.getModelInstance(organizationModelName);
    var relationDbModels = Model.getModelInstance(relationModelName);
    return Promise.map(item, (currDaughter) => {
        let daughter_org_name = currDaughter.org_name;
        let createOrgP = organizationDbModels.create({ 'name': daughter_org_name });
        return createOrgP.then((organization) => {
            return relationDbModels.create({ 'organization_id': organization._id, 'organization_name': organization.name, 'parent_id': parentId }).then(() => {
                if ("daughters" in currDaughter && currDaughter.daughters.length > 0) {
                    processChildren(currDaughter.daughters, ret, organization._id);
                }
            });
        });
    });
}

OrganizationService.prototype.createOrganizationTree = function (payload) {
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

OrganizationService.prototype.getOrganizationTree = function (queryParams) {
    const Op = Sequelize.Op;
    var offset = parseInt(queryParams.offset) || parseInt(pagination.offset);
    var limit = parseInt(queryParams.limit) || parseInt(pagination.limit);
    var relationDbModel = Model.getModelInstance(relationModelName);
    var organizationDbModels = Model.getModelInstance(organizationModelName);
    var organizationNameP = organizationDbModels.findOne({ where: { 'name': queryParams.organization_name } });

    return organizationNameP.then((orgInfo) => { 
        if(!orgInfo)
            return Promise.reject({
                'customCode': 400,
                'message': "BADREQUEST",
                'errors': "Organization tree not found."
            });
        var parentsP = relationDbModel.findAll({
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
        });

        var siblingsP = relationDbModel.findAll({
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
        });

        var kidsP = relationDbModel.findAll({
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
        });
        return Promise.join(parentsP, siblingsP, kidsP)
    }).spread((parentsInfo, siblingsInfo, kidsInfo) => {
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

        all.sort(function (orgObj1, orgObj2) {
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
    });
};


module.exports = {
    getInst: function () {
        return new OrganizationService();
    }
};
