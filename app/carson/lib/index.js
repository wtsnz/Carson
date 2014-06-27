var cmd = require('./cmd.js');
var Repository = require("./repository.js");

module.exports.clone = function clone(path, folder, uri, callback) {
    var repo, error;
    callback = callback || function() {};

    var params = ["clone", "--progress", uri, folder];

    console.log("params: " + params);

    var output = "";

    cmd.execute("git", params, path, function(out) {

        output += out;

        if (cmd.startsWith(out, "Cloning into")) {
            var r = out.match(/'(.*)'/g) + "";
            if (r.length > 0) {
                repo = new Repository(path + "/" + r.replace(/'/g, ""));
            } else {
                error = "Failed to clone repository.";
            }
        }
    }, function(output) {

        callback(error, repo, output);

    });
};