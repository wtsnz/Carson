var fs = require("fs");
var spawn = require("child_process").spawn;

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

module.exports.startsWith = function(s1, s2) {
    return s1.lastIndexOf(s2, 0) === 0;
};

module.exports.mkdir = function(path, callback) {
    fs.stat(path, function(err, stats) {
        if (err) {
            mkdirp(path, function(err) {
                if (err) console.error(err)
                else callback();
            });
        } else callback();
    });
};

module.exports.execute = function(cmd, args, path, sysout, callback) {
    this.mkdir(path, function() {
        var buff = "";
        var out = "";
        var proc = spawn(cmd, args, {
            cwd: path,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        proc.stdout.on("data", function(d) {
            buff += d.toString();
            out += d.toString();
            //console.log("stdout: " + d.toString())
            var i;

            while ((i = buff.indexOf("\n")) > -1) {
                //sysout(buff.substring(0, i));
                buff = buff.substring(i + 1);
            };
        });

        proc.stderr.on("data", function(d) {
            buff += d.toString();
            //console.log("stderr: " + d.toString())
            out += d.toString();
            var i;

            while ((i = buff.indexOf("\n")) > -1) {
                //sysout(buff.substring(0, i));
                buff = buff.substring(i + 1);
            };
        });

        proc.on("close", function() {
            if (buff.length > 0) {
                //sysout(buff);
            }
            console.log(out);
            callback(out);
        });
    });
};