var bootstrap = require("./boot/bootstrap.js");
var _         = require("lodash");
var debug     = require("debug")("schedulerserver");
var config    = require("./config");
var bootP     = bootstrap.init(config, ['rabbitmqConsumer']);
var schedulerInst = require("./schedulejobs");

function schedulerInit(){
    return bootP.then(()=>{
        var senderM = require("./ws/sender.js").send;
        bootstrap.bootsender(senderM);
        bootstrap.bootredis();
        bootstrap.bootrabbitmq();
        bootstrap.enableHealthMonitoring("schedular");
        return schedulerInst.start();
    });
}

schedulerInit();

