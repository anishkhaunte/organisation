var fs = require('fs');
var exports = {};

function extend (original, other) {
    var keys = Object.keys(other);

    var i;
    while (i = keys.pop()) {
        if (original[i])
            throw new Error('Util ' + i + 'already exists');
        original[i] = other[i];
    }
    return original;
}

function extendExports(filename) {
    if ('index.js' === filename) return;
    exports = extend(exports, require('./' + filename));
}

fs.readdirSync(__dirname).forEach(extendExports);

module.exports = exports;
