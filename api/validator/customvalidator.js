//var validator = require('../validator');
var _ = require('lodash');

function process(req, res){
    var body = req.body;
    console.log(body)
    var pattern = new RegExp("^[6-9]\\d{9}$");
    body.contacts = _.filter(body.contacts, function(_A1) {
        return pattern.test(_A1.phoneNo);
    });
    console.log(body);
    req.body = body;
    return;
}

module.exports = {
   process: process
};
