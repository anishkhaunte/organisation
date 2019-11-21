const uuidv4 = require('uuid').v4;


function createID(idprefix) {
    return idprefix + '-' +  uuidv4();
}

function IDGeneratorFactory (_prefix) {
    return createID(_prefix);
}

//modelname : prefix
var idmap = {
	Oragnizations   : 'org',
    Relations       : 'rel'
};

exports.generateId = function(modelName){
    return IDGeneratorFactory(idmap[modelName]);
};
