var bootstrap = require("./boot/bootstrap.js");
var config = require("./config");

function init(){
    return bootstrap.init(config).then(()=>{
        bootstrap.bootredis();
        bootstrap.bootrabbitmq();
        bootstrap.enableHealthMonitoring("job");

        var senderM = require("./ws/sender.js").send;
        bootstrap.bootsender(senderM);

        var app = require("./messagebroker/consumer.js");
        return app.init();
    });
}


module.exports = init();
