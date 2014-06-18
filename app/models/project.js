var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    name: String
});

module.exports = mongoose.model('Project', projectSchema);