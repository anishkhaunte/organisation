var Promise            = require('bluebird');
var _                  = require('lodash');

module.exports = {
    getHealth : function(middlewares){
        var allP = Promise.map(middlewares,(m)=>{
            return this[m]();
        });
        return Promise.all(allP).then((x) => {
            return Object.assign({}, ...x);
        });
    }, 
    cache: ()=>Promise.resolve({ cache: redis.status}) ,
    db : ()=>  Promise.resolve({ db: dbConnStatus.getConnHealth()}),
    mq: ()=>{ if(config.get("rabbitmq").enableRabbitMq && RMQ_CON._currentConnection) return Promise.resolve({ mq: RMQ_CON._currentConnection.connection.stream.readable}); else return {mq: false} },

    //[{"api":{"cache":"ready","db":[0,1],"mq":true}},{"ws":null},{"schedular":null}]
    okHealth : function(svc, res, service){
        if(!_.get(res, service+"."+svc) || !this[svc+"Ok"](_.get(res, service+"."+svc)) )
            return true;
        return false;
    }, 
    cacheOk: (data)=> ["connect","ready"].indexOf(data)>-1? true: false,
    dbOk: (data)=> _.uniq(data).filter((x)=>x===1).length===1? true: false,
    mqOk: (data)=> data? true:false
}
