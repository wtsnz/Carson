var cmd = require("./cmd.js");
//var Diff = require("./diff.js");

function Commit(repo, hash, author, email, date, subject) {
    this.repo = repo;
    this.hash = hash;
    this.subject = subject;

    this.author = author;
    this.email = email;
    this.date = new Date(date);
};

/*
Commit.prototype.getDiff = function getDiff(callback) {
    var buff = [];
    var err = false;

    cmd.execute("git", ["show", this.hash], this.repo.local, function(out) {
        buff.push(out);
    }, function() {
        if (buff.length === 0)
            err = "No such commit ! " + this.hash;
        else {
            var diff = [
                []
            ];

            for (var i = 0; i < buff.length; i++) {
                if (cmd.startsWith(buff[i], "@@")) {
                    diff.push([buff[i]]);
                } else {
                    diff[diff.length - 1].push(buff[i]);
                }
            };

            diff.shift();
        }

        err ? callback(err) : callback(undefined, new Diff(diff));
    }.bind(this));
};
*/
module.exports = Commit;