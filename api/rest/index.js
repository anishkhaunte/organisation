var debug     = require('debug')('APILoader');
var validator = require('../validator');
var fs        = require("fs");
var path      = require('path');
var _ = require("lodash");
function APILoader(app) {
    var methods = ['all', 'get', 'post', 'put', 'delete'];

    /**
     * This method loads mappings and applies to Express Server
     *
     * @param mappings : Object containing url mapping to service
     *                  Ex: {
     *                      '/User': {
     *                          get: function
     *                          post: function
     *                      }
     *                  }
     */
    function getPathForSwagger(urlMap) {
        var url = urlMap.split("/");
        for (var i = 0; i < url.length; i++) {
            if (url[i].startsWith(":")) {
                url[i] = "{" + url[i].slice(1) + "}";
            }
        }
        return url.join("/");
    }

    function loadMappings(mappings, route) {
        route = route || '';
        var key, urlMap, mapping;
        for (key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                if (methods.indexOf(key) >= 0) {
                    urlMap = route;
                    debug('mapping %s for %s', urlMap, key);
                    mapping = mappings[key];
                    switch (typeof mapping) {
                        case 'function':
                            app[key](urlMap, mapping);
                            break;
                        case 'object':
                            var validator_fn = validator.getValidator(mapping);
                            mapping.callbacks.unshift(validator_fn);
                            app[key](urlMap, mapping.callbacks);   //final api callback reistrations
                            debug(key, urlMap, mapping.callbacks);
                            break;
                    }
                } else {
                    var ph = route+key;
                    if(key.indexOf('\\') === 0)  //logic to write route from base
                        ph = key.split("\\")[1];
                    loadMappings(mappings[key], ph);
                }
            }
        }
    }

    /**
     * Loads REST Modules from FileSystem
     */
    function loadAPIModule(filepath) {
        var restApi = require(filepath);
        if (restApi && restApi.getMappings) {
            loadMappings(restApi.getMappings(), restApi.url_prefix);
        }
    }



    try{
        var files = fs.readdirSync(__dirname);

        files.forEach(function(file){
            if(['.','..',"index.js"].indexOf(file) > -1 ) {
                return;
            }
            var filePath = path.join(__dirname, file);
            var pathStat = fs.statSync(filePath);
            if(pathStat.isFile() && file.substr(-3) === '.js') {
                loadAPIModule(filePath, app);
            }
        });

    } catch (err) {
        console.log('APILoader Fatal error, unable to load rest apis', err && err.stack);
        throw err;
    }

}

module.exports = {
    'load': APILoader
};
