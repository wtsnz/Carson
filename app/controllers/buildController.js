var Project = require('../models/project');
var Build = require('../models/build');

var CarsonProject = require('../carson/project');
var CarsonTestflightPlugin = require('../carson/plugins/testflight');


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

            // Temp build function
            buildCarsonProject(project, build)

            return res.redirect('/projects/' + project.slug);
        });

    });
}

var buildCarsonProject = function(project, build) {

    console.log("Build: " + build._id + " with Repository " + project.repository)

    var carsonProject = new CarsonProject(build._id, project.repository);

    build.status = "Cloning";
    build.save();

    carsonProject.createFolders(function(err) {

        build.status = "Cloning";
        build.save();

        carsonProject.clone(function(err) {

            carsonProject.checkout("develop", function(err) {

                build.status = "Pod Install";
                build.save();

                carsonProject.installPods(function(err) {

                    build.status = "Building";
                    build.save();

                    carsonProject.build(function(err, okay) {
                        console.log(err);

                        build.status = "Archiving";
                        build.save();

                        carsonProject.archive(function(err, okay) {
                            console.log(err);

                            if (project.plugins.testflight.enabled == true) {
                                build.status = "Uploading";
                                build.save();


                                //teamToken, apiToken, distributionLists
                                var testflight = new CarsonTestflightPlugin(project.plugins.testflight.teamToken, project.plugins.testflight.apiToken, project.plugins.testflight.distributionLists);

                                carsonProject.upload(testflight, function(err, okay) {
                                    console.log("done");

                                    build.status = "Completed";
                                    build.save();

                                });

                            } else {

                                console.log("Not uploading, done");

                                build.status = "Completed";
                                build.save();

                            }


                        });
                    });
                });
            })
        });
    });

};