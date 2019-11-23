var bootstrap = require("./boot/bootstrap.js");
var config = require("./config");

function init(){
    return bootstrap.init(config).then(()=>{
        var app = require("./api");
        return app.start();
    });
}


module.exports = init();
