var Project = require('../models/project');
var Build = require('../models/build');

module.exports.getNewProject = function(req, res) {

    return res.render('projects/new', {
        message: req.flash('loginMessage'),
        errors: req.flash('errors'),
        title: "New Project",
        user: req.user
    })
}

module.exports.postNewProject = function(req, res) {

    // Validate form input
    req.checkBody('name', 'Please enter a project name').notEmpty()
    req.checkBody('repository', 'Please enter a valid repository').notEmpty()
    req.checkBody('configuration', 'Please enter a valid configuration').isJSON()

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors)
        return res.redirect('/projects/new')
    };

    Project.findOne({
        'name': req.body.name
    }, function(err, project) {
        // if there are any errors, return the error
        if (err) {
            req.flash('errors', [{
                msg: "Database error"
            }])
            return res.redirect('/projects/new')
        }

        // check to see if theres already a user with that email
        if (project) {
            req.flash('errors', [{
                msg: "A project already exists with that name"
            }])
            return res.redirect('/projects/new')
        } else {

            // Create the project
            var newProject = new Project({
                name: req.body.name,
                repository: req.body.repository,
                configuration: req.body.configuration
            });
            // save the user
            newProject.save(function(err, project, count) {
                if (err) {
                    throw err;
                }
                return res.redirect('/projects/' + project.slug);
            });
        }

    });

}

module.exports.show = function(req, res) {

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

        Build.find({
            'project': project._id
        })
            .sort('-createdAt')
            .exec(function(err, builds) {
                return res.render('projects/show', {
                    message: req.flash('loginMessage'),
                    errors: req.flash('errors'),
                    title: project.name,
                    user: req.user,
                    project: project,
                    builds: builds
                })
            });



    });
}

module.exports.update = function(req, res) {

    // Validate form input
    req.checkBody('name', 'Please enter a project name').notEmpty()
    req.checkBody('repository', 'Please enter a valid repository').notEmpty()
    req.checkBody('configuration', 'Please enter a valid configuration').isJSON()

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors)
        return res.redirect('/projects/' + req.params.projectSlug)
    };

    Project.findOne({
        'slug': req.params.projectSlug
    }, function(err, project) {
        // if there are any errors, return the error
        if (err || !project) {
            return res.redirect('/')
        }

        project.name = req.body.name;
        project.repository = req.body.repository;
        project.configuration = req.body.configuration;

        project.save(function(err, project) {
            return res.render('projects/show', {
                message: req.flash('loginMessage'),
                errors: req.flash('errors'),
                title: project.name,
                user: req.user,
                project: project
            })
        });
    });
}

module.exports.index = function(req, res) {

    return res.render('projects/index', {
        message: req.flash('loginMessage'),
        errors: req.flash('errors'),
        title: "New Project",
        user: req.user
    })
}