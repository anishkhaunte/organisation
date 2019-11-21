var bootstrap = require("./boot/bootstrap.js");
var config = require("./config");

function init(){
    return bootstrap.init(config).then(()=>{
        //bootstrap.bootredis();
        //bootstrap.bootrabbitmq();
       // bootstrap.enableHealthMonitoring("api");
        //TODO: 
       // var senderM = require("./ws/sender.js").send;
        //bootstrap.bootsender(senderM);

        var app = require("./api");
        return app.start();
    });
}


module.exports = init();
