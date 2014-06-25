var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var projectSchema = mongoose.Schema({
    name: String,
    slug: String,
    repository: String,
    branch: {
        type: String,
        default: "master"
    },
    configuration: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    plugins: {
        testflight: {
            enabled: {
                type: Boolean,
                default: false
            },
            teamToken: {
                type: String,
                default: ""
            },
            apiToken: {
                type: String,
                default: ""
            },
            distributionLists: {
                type: String,
                default: ""
            }
        }
    },
    lastBuild: {
        date: Date,
        commit: String,
        branch: String,
        status: String,
        id: ObjectId
    },
    buildCount: Number
});

projectSchema.pre('save', function(next) {
    this.slug = slugify(this.name);
    next();
});

module.exports = mongoose.model('Project', projectSchema);


function slugify(text) {

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}