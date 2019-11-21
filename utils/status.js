let _ = require("lodash");


function getOverallStatus(statusarray)
{
    statusarray = _.uniq(statusarray);
    let statusv = { "busy": 0, "online": 1, "away":2 , "offline":3};
    let status="offline";
    let cv=3;
    statusarray.map((e)=>{
        e = e.toLowerCase();
        if(statusv[e] < cv) {
            cv = statusv[e]
            status = e;
        }
    });
    return status;
}


exports.getOverallStatus = function (statusarray) {
	return getOverallStatus(statusarray);
}