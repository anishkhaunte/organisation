var express               = require("express");
var bodyParser            = require("body-parser");
var cors                  = require("cors");
//var authMiddleware        = require("./authMiddleware");
var morgan                = require("morgan");
var rest                  = require("./rest");
var helmet                = require("helmet");

var app = express();
app.use(helmet());

app.disable("etag").disable("x-powered-by");

if(config.get("app").cors){
    app.use(cors());
}

app.use(morgan("combined", {
    skip: function (req, res) { return res.statusCode < 400; }
}));


app.use(bodyParser.urlencoded({ extended: false   }));
app.use((req, res, next) => {
    bodyParser.json({ verify: addRawBody, limit:"1mb" })(req, res, (err) => {
        if (err) {
            console.log("bodyparser err ", err);
            res.sendStatus(400);
            return;
        }
        next();
    });
});
function addRawBody(req, res, buf, encoding) {
    req.rawBody = buf.toString();
}

//app.use(authMiddleware());


/*/
* This middleware will stringify all values in req.query.
* This is to avoid Object type values in query params,
* which can lead to noSQL injection in mongo.
* Does not stringify Strings & Arrays
*/
app.use("/", function(req, res, next) {
    for (var q in req.query) {
        if (req.query[q] && typeof req.query[q] !== "string" && !Array.isArray(req.query[q])) {
            req.query[q] = JSON.stringify(req.query[q]);
        }
    }
    next();
});

rest.load(app);

module.exports.start = function() {
    return app.listen(process.env.API_PORT || config.get("app").port, function(err) {
        if (err) {
            console.log("Error in starting api server:", err);
        }

        console.log("api server listening on",  process.env.API_PORT || config.get("app").port || 5000);
    });
};
