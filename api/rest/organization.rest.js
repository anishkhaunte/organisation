var OrganizationService = require('../services/OrganizationService.js');
var paramType = require('../validator/paramTypes.js');
var serviceHandler = require('../serviceHandler.js').serviceHandler;

module.exports.getOrganization = function (req, res) {
    var _serviceInst = OrganizationService.getInst();
    serviceHandler(req, res, _serviceInst.getOrganizationTree( req.query));
};

module.exports.createOrganization = function (req, res) {
    var _serviceInst = OrganizationService.getInst();
    serviceHandler(req, res, _serviceInst.createOrganizationTree(req.body));
};

module.exports.url_prefix = "/api/organization";
module.exports.getMappings = function () {
    return {
        get : {
            tags: ["Organization"],
			summary: "Get Organizations",
            callbacks : [this.getOrganization],
            parameters : [
                paramType.header("authorization","access token","string",true),
                paramType.query("offset","For pagination of records","number",true),
                paramType.query("organization_id","Organization id to fetch the tree","number",true)
            ]
        },
        post: {
            tags: ["Organization"],
			summary: "Create Organization",
            callbacks: [this.createOrganization],
            parameters: [
                paramType.header("authorization", "access token", "string", true),
                paramType.body("body", "payload", "addOrgTree", true)
            ]
        }
    };
};
