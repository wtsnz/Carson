module.exports = function(app, passport, express) {


    //
    //  Website Routes
    //

    app.get('/', ensureLoggedIn, function(req, res) {
        res.render('index', {
            user: req.user,
            title: "Home"
        });
    });


    app.get('/login', function(req, res) {
        res.render('login', {
            message: req.flash('loginMessage'),
            errors: req.flash('errors'),
            title: "Login"
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));


    app.get('/signup', function(req, res) {
        res.render('signup', {
            message: req.flash('signupMessage'),
            errors: req.flash('errors'),
            title: "Signup"
        });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));


    app.get('/profile', ensureLoggedIn, function(req, res) {
        res.render('profile', {
            user: req.user,
            title: "Profile"
        });
    });


    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    //
    //  API Routes
    //

    var router = express.Router();

    router.get('/', function(req, res) {
        res.json({
            hello: "world"
        });
    });

    app.use('/api', router);

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