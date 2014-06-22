var Project = require('../models/project');
var Build = require('../models/build');

module.exports.build = function(req, res) {

    // Ensure that we have a projectSlug

    if (!req.params.projectSlug) {
        return res.redirect('/')
    };

    Project.findOne({
        'slug': req.params.projectSlug
    }, function(err, project) {

        // if there are any errors, return the error
        if (err || !project) {
            return res.redirect('/')
        }

        // Create the build
        var newBuild = new Build({
            project: project,
            status: "Completed"
        });
        // save the user
        newBuild.save(function(err, build, count) {
            if (err) {
                throw err;
            }
            return res.redirect('/projects/' + project.slug);
        });

    });
}