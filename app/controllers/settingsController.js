var User = require('../models/user');

module.exports.index = function(req, res) {

    User.find()
        .sort('-createdAt')
        .exec(function(err, users) {
            return res.render('settings/index', {
                message: req.flash('loginMessage'),
                errors: req.flash('errors'),
                title: "Settings",
                user: req.user,
                users: users
            })
        });

}