var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

var buildSchema = mongoose.Schema({
    project: ObjectId,
    status: String,
    output: String,
    configuration: {
        commit: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

buildSchema.methods.tableRowClass = function() {
    if (this.status === "Completed") {
        return "success"
    } else if (this.status === "In Progress") {
        return "info"
    } else if (this.status === "Failed") {
        return "danger"
    }
    return ""
}

module.exports = mongoose.model('Build', buildSchema);