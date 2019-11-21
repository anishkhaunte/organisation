module.exports = {
    "addOrgTree" : {
        "id" : "addOrgTree",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "org_name": {
                "type": 'string',
                "minLength": 1,
                "maxLength": 200
            },
            "daughters":{
                "type" : "array",
                "items" : {
                    "type": 'object'
                }
            }
        },
        "required": ["org_name"]
    }
};
