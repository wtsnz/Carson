module.exports.getLogin = function(req, res) {

    return res.render('login', {
        message: req.flash('loginMessage'),
        errors: req.flash('errors'),
        title: "Login"
    })
}

module.exports.postLogin = function(passport) {

    return passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
}

module.exports.getSignup = function(req, res) {

    return res.render('signup', {
        message: req.flash('signupMessage'),
        errors: req.flash('errors'),
        title: "Signup"
    })
}

module.exports.postSignup = function(passport) {

    return passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    })
}

module.exports.getProfile = function(req, res) {

    return res.render('profile', {
        user: req.user,
        title: "Profile"
    });
}

module.exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
}