var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var buildSchema = mongoose.Schema({
    project: ObjectId,
    status: {
        type: String,
        default: "Waiting"
    },
    output: {
        type: String,
        default: ""
    },
    configuration: {
        commit: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        default: "User"
    }
});

var Project = require('./project');

buildSchema.post('save', function() {

    var self = this;

    Project.findOne({
        '_id': self.project
    }, function(err, project) {

        if (!project.lastBuild) {
            project.lastBuild = {}
        };

        project.lastBuild.date = self.createdAt
        project.lastBuild.commit = "asdsadsad"
        project.lastBuild.branch = "deploy"
        project.save()

    });


});

buildSchema.methods.tableRowClass = function() {
    if (this.status === "Waiting") {
        return "active"
    } else if ((this.status === "Cloning") || (this.status === "Pod Install") || (this.status === "Building") || (this.status === "Archiving") || (this.status === "Uploading")) {
        return "info"
    } else if (this.status === "Completed") {
        return "success"
    } else if (this.status === "Failed") {
        return "danger"
    }
    return ""
}

module.exports = mongoose.model('Build', buildSchema);