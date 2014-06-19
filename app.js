// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var expressValidator = require('express-validator');

//
//  Connect to mongoose
//

var configDB = require('./config/database.js');

mongoose.connect(configDB.url);

//
//  Passport
//

require('./config/passport')(passport);

//
//  Configure App
//

{
    app.set('views', path.join(__dirname, 'app/views'));
    app.set('view engine', 'jade');
    app.locals.basedir = path.join(__dirname, 'app/views');

    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(expressValidator());
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.locals.pretty = true;

    // required for passport
    app.use(session({
        secret: 'yolo',
        store: new MongoStore({
            mongoose_connection: mongoose.connection
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
}

//
//  Load Routes
//

require('./app/routes.js')(app, passport, express);

//
//  Start the server!
//

var server = app.listen(port);
console.log("Carson started on port " + port);
module.exports = app;