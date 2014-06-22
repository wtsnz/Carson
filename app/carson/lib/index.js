var cmd = require('./cmd.js');
var Repository = require("./repository.js");

module.exports.clone = function clone(path, folder, uri, callback) {
    var repo, error;
    callback = callback || function() {};

    cmd.execute("git", ["clone", uri, folder], path, function(out) {
        if (cmd.startsWith(out, "Cloning into")) {
            var r = out.match(/'(.*)'/g) + "";
            if (r.length > 0) {
                repo = new Repository(path + "/" + r.replace(/'/g, ""));
            } else {
                error = "Failed to clone repository.";
            }
        }
    }, function() {
        callback(error, repo);
    });
};