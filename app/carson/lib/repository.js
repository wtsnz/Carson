var cmd = require("./cmd.js");
var fs = require('fs');
var Commit = require("./commit.js");

function Repository(local) {
    this.local = local;
    console.log(local);
};

Repository.prototype.isRepository = function isRepository(callback) {
    var b = false;

    cmd.execute("git", ["rev-parse", "--is-inside-work-tree"], this.local, function(out) {
        if (out === "true")
            b = true;
    }, function() {
        callback(b);
    });
};

Repository.prototype.add = function add(filepattern, callback) {
    var err = false;

    cmd.execute("git", ["add", filepattern], this.local, function(out) {
        if (cmd.startsWith(out, "fatal")) {
            err = out;
        }
    }, function() {
        callback(err);
    });
};

Repository.prototype.listCommits = function listCommits(limit, callback) {
    var commits = [];
    var params = ["log", "--oneline", "--pretty=format:%H;%an;%ae;%ad;%s"];
    var err = false;

    if (typeof limit === "number")
        params.push("-" + limit);
    else
        callback = limit;

    cmd.execute("git", params, this.local, function(out) {
        out = out.split(";");
        commits.push(new Commit(this, out.shift(), out.shift(), out.shift(), out.shift(), out.join(";")));
    }, function() {
        callback(err, commits);
    });
};

Repository.prototype.reset = function listCommits(hard, callback) {

    var params = ["reset"];

    if (force) {
        params.push("--hard")
    };

    var err = false;

    cmd.execute("git", params, this.local, function(out) {

    }, function() {
        callback(err, commits);
    });
};

Repository.prototype.pull = function pull(callback) {

    var params = ["pull"];

    var err = false;

    cmd.execute("git", params, this.local, function(out) {

    }, function() {
        callback(err, commits);
    });
};

Repository.prototype.checkout = function checkout(branch, callback) {

    var params = ["pull"];

    var err = false;

    cmd.execute("git", params, this.local, function(out) {

    }, function() {
        callback(err, commits);
    });
};

module.exports = Repository;