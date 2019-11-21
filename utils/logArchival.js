var fs = require('fs');
var os = require("os");
var moment = require("moment");
var archive_file = "/logs/" + (process.env.LOG_INITIAL||os.hostname());
console.log("sending archive data to", archive_file);


module.exports = {
    log : function(eventId, additionalString){
        var date = new Date();
        var t1= moment(date).format("DD/MM/YY");
        var t2= moment(date).format("HH:mm:ss");
        var voting_details = [eventId,date.toISOString(), additionalString, t1,t2].join(",");

        var filePath = archive_file +"_" +eventId +"_vl.txt";
        fs.appendFile(filePath, voting_details + '\n', ()=>{});
    },
}
