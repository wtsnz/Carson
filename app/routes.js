var Project = require('./models/project');

module.exports = function(app, passport, express) {


    //
    //  Website Routes
    //

    app.get('/', ensureLoggedIn, function(req, res) {

        Project.find()
            .sort('-updated_at')
            .exec(function(err, projects) {

                res.render('index', {
                    user: req.user,
                    title: "Home",
                    projects: projects
                });
            });
    });


    //
    //  User Routes
    //

    var userController = require('./controllers/userController')

    app.get('/login', userController.getLogin)
    app.post('/login', userController.postLogin(passport))

    app.get('/signup', userController.getSignup)
    app.post('/signup', userController.postSignup(passport))

    app.get('/profile', ensureLoggedIn, userController.getProfile)

    app.get('/logout', userController.logout)


    //
    //  Project Routes
    //
    var projectController = require('./controllers/projectController')
    var projectsRouter = express.Router();
    projectsRouter.get('/new', projectController.getNewProject)
    projectsRouter.post('/new', projectController.postNewProject)

    projectsRouter.get('/', projectController.index)
    projectsRouter.get('/:projectSlug', projectController.show)
    projectsRouter.post('/:projectSlug', projectController.update)

    app.use('/projects', projectsRouter);

    //
    //  API Routes
    //

    var router = express.Router();

    router.get('/', function(req, res) {
        res.json({
            hello: "world"
        });
    });

    app.use('/api/v1', router);

    /// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    /// error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });


};


function ensureLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}