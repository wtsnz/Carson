var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    name: String,
    slug: String,
    repository: String,
    configuration: String
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