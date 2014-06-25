var fs = require('fs');
var Git = require("./lib");
var cmd = require('./lib/cmd.js');
var plist = require('plist');
var path = require("path");
var util = require('util');
var TestFlight = require('./plugins/testflight.js');
var Repository = require('./lib/repository.js');

var CARSON_TEMP_DIRECTORY = "/tmp/carson/projects/";

function Project(name, repositoryUrl) {
    this.name = name;
    this.repositoryUrl = repositoryUrl;

    this.buildFolder = "build";
    this.repositoryFolder = "repository";
    this.archiveFolder = "archive.xcarchive";

    this.repository = new Repository(this.repositoryPath());
    /*
    this.repository.listCommits(10, function(err, commits) {
        commits.forEach(function(commit, index, array) {
            console.log(commit.hash + ": " + commit.author + " - " + commit.subject);
        });
    });
*/
    this.info = {};
    this.workspaces = [];
    this.projects = [];
};

Project.prototype.hasRepository = function hasRepository() {
    var gitPath = this.repositoryPath() + "/.git";
    return fs.existsSync(gitPath);
}

Project.prototype.projectPath = function projectPath() {
    return CARSON_TEMP_DIRECTORY + this.name;
}

Project.prototype.repositoryPath = function repositoryPath() {
    return this.projectPath() + "/" + this.repositoryFolder;
}

Project.prototype.buildPath = function buildPath() {
    return this.projectPath() + "/" + this.buildFolder;
}

Project.prototype.archivePath = function archivePath() {
    return this.buildPath() + "/" + this.archiveFolder;
}

Project.prototype.createFolders = function createFolders(callback) {

    var self = this;

    cmd.mkdir(self.projectPath(), function(err, okay) {
        cmd.mkdir(self.repositoryPath(), function(err, okay) {
            cmd.mkdir(self.buildPath(), function(err, okay) {
                if (callback) {
                    callback()
                }
            });
        });
    });
}

Project.prototype.clone = function initRepository(callback) {
    Git.clone(this.projectPath(), this.repositoryFolder, this.repositoryUrl, function(err, repo) {
        console.log("Cloned Repository" + err);
        if (err) {
            throw err;
        }
        callback();
    });
}

Project.prototype.checkout = function checkout(branch, callback) {
    this.repository.checkout(branch, function() {
        callback();
    });
}

Project.prototype.installPods = function installPods(callback) {

    var self = this;

    //self.createFolders();

    function setupDefaults() {

        console.log("Looking for Workspaces + Projects");
        self.determineWorkspaceOrProject(function(err) {
            console.log("Looking for schemes");
            self.determineScheme(function(err) {
                callback();
            })
        })
    }

    if (self.hasPodfile()) {
        console.log("Podfile found. Running pod install");
        self.podInstall(function(test) {
            console.log("Pod install complete")
            setupDefaults();
        });
    } else {
        setupDefaults();
    }



};


// Check for Podfile
Project.prototype.hasPodfile = function hasPodfile() {

    var hasPodfile = false;

    if (fs.existsSync(this.repositoryPath() + "/Podfile")) {
        hasPodfile = true;
    }

    return hasPodfile;
}

Project.prototype.podInstall = function podInstall(callback) {

    var err = false;

    cmd.execute("pod", ["install"], this.repositoryPath(), function(out) {
        if (cmd.startsWith(out, "fatal")) {
            err = out;
        }
    }, function() {
        callback(err);
    });

}

// Run Pod install
Project.prototype.determineWorkspaceOrProject = function determineWorkspaceOrProject(callback) {

    var self = this;

    fs.readdir(this.repositoryPath(), function(err, files) {

        var workspaces = [];
        var projects = [];

        files.forEach(function(obj, index, array) {
            if (path.extname(obj) === '.xcworkspace') {
                workspaces.push(obj);
            } else if (path.extname(obj) === '.xcodeproj') {
                projects.push(obj);
            }
        });

        console.log("Workspaces Found: " + workspaces);
        console.log("Projects Found: " + projects);

        self.workspaces = workspaces;
        self.projects = projects;

        callback();

    });

    return;
}

// Run Pod install
Project.prototype.determineScheme = function determineScheme(callback) {

    var self = this;

    cmd.execute("xcodebuild", ["-list"], this.repositoryPath(), function(out) {

        if (cmd.startsWith(out, "xcodebuild: error")) {
            err = out;
        }

    }, function(buff) {
        var lines = buff.split(/\n/);

        // Find project name
        var projectName = lines.shift().match(/\"(.+)\"\:/)[1];

        var info = {};

        info.project = projectName;

        var group = null;

        lines.forEach(function(obj, index, array) {

            // Find categories
            if (obj.match(/\:$/)) {
                group = obj.slice(0, -1).replace(/^\s+|\s+$/g, '').toLowerCase().replace(/\s+/, '_');
                info[group] = [];
            }

            // Add values
            else if (!obj.match(/\.$/)) {
                info[group].push(obj.replace(/^\s+|\s+$/g, ''));
            };

        });

        // Remove empty values
        for (var key in info) {
            if (info.hasOwnProperty(key)) {
                var value = info[key];
                if (util.isArray(value)) {
                    info[key] = value.filter(function(v) {
                        return v !== ''
                    });
                };
            }
        }

        self.info = info;

        callback();

    });
}

// Build project
Project.prototype.build = function build(callback) {

    var args = [];

    // Figure out workspace or project file
    // Only supports one of each, and uses the first
    if (this.workspaces.length) {
        args.push("-workspace");
        args.push(this.workspaces[0]);
    } else {
        args.push("-project");
        args.push(this.projects[0]);
    }

    // Scheme
    var scheme = this.info.schemes[0];
    args.push("-scheme");
    args.push(scheme);

    args.push("archive");
    args.push("-archivePath");
    args.push(this.archivePath());

    console.log("Args: " + args);

    var err = false;
    cmd.execute("xctool", args, this.repositoryPath(), function(out) {
        if (cmd.startsWith(out, "fatal")) {
            err = out;
        }
    }, function() {
        callback(err);
    });
}

// Sign archive
Project.prototype.archive = function archive(callback) {

    var self = this;
    // Parse the plist

    var infoPlist = plist.parse(fs.readFileSync(self.archivePath() + "/Info.plist", 'utf8'));

    var applicationPath = self.archivePath() + "/Products/" + infoPlist.ApplicationProperties.ApplicationPath;

    var err = false;

    var projectName = this.info.project;

    var dsymFolder = self.archivePath() + "/dSYMs/";
    var dsymFile = projectName + ".app.dSYM";
    var dsymPath = dsymFolder + dsymFile;

    var ipaOutputPath = self.buildPath() + "/" + projectName + ".ipa";
    var dsymOutputPath = self.buildPath() + "/" + projectName + ".app.dSYM.zip";

    // Archive and Sign
    console.log("Building");
    cmd.execute("xcrun", ["-log", "-sdk", "iphoneos", "PackageApplication", "-v", applicationPath, "-o", ipaOutputPath], self.repositoryPath(), function(out) {
        //console.log(out);
        if (cmd.startsWith(out, "fatal")) {
            err = out;
        }
    }, function() {

        if (!err) {

            // Zip dSYM
            console.log("Zipping");
            cmd.execute("zip", ["-r", "-9", dsymOutputPath, dsymFile], dsymFolder, function(out) {
                console.log(out);
                if (cmd.startsWith(out, "fatal")) {
                    err = out;
                }
            }, function() {

                callback(err);

            });
        };
    });
}

// Sign archive
Project.prototype.upload = function upload(uploadPlugin, callback) {

    var self = this;
    // Parse the plist

    var projectName = this.info.project;

    /*
    var TEAM_TOKEN = "fd1caf1c417868dbad53aa0fe9594173_MzkzODM3MjAxNC0wNi0xNCAyMzoxMDowOS45NTExNzA";
    var PK_TEAM_TOKEN = "32aef4ec5435cc6cc725232d9c3c59e6_MzQ1MDkzMjAxNC0wMy0xNyAyMDozMTo0Ni42NDMwNzk";
    var API_TOKEN = "92a0911981aab7a97180be3508e426f_MTUwNzc1MjAxMS0wOS0wOSAwODo0NTo1MC4zNTM1MjA";

    var testFlight = new TestFlight(TEAM_TOKEN, API_TOKEN, ['Internal']);
*/

    var ipaOutputPath = self.buildPath() + "/" + projectName + ".ipa";
    var dsymOutputPath = self.buildPath() + "/" + projectName + ".app.dSYM.zip";

    uploadPlugin.upload(ipaOutputPath, dsymOutputPath, function(err, body) {
        console.log(err + " " + body);
        callback();
    })
}

module.exports = Project;