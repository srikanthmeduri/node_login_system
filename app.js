var config = require('./config');
var express = require('express');
var app = express();
var port = config.port;
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var flash = require('connect-flash');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var User = require('./server/modules/models');


console.log(config.database);
mongoose.connect(config.database); // connect to our database

var env = process.env.NODE_ENV || 'development';

if ('development' == env) {
    //app.use(morgan('dev'));   // log every request to the console
}

app.use(cookieParser()); // read cookies (needed for auth)
app.use(expressValidator());
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

//ejs
var pbc = path.join(__dirname, '/public');
app.use(express.static(pbc));


app.set('views', pbc);
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);


// Serialize the user id to push into the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Deserialize the user object based on a pre-serialized token
// which is the user id
passport.deserializeUser(function(id, done) {
    User.findOne({
        _id: id
    }, '-salt -hashed_password', function(err, user) {
        done(err, user);
    });
});

// Use local strategy
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Unknown user'
                });
            }
            if (!user.authenticate(password)) {
                return done(null, false, {
                    message: 'Invalid password'
                });
            }
            return done(null, user);
        });
    }
));

// Use facebook strategy
passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({
            'facebook.id': profile.id
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(err, user);
            }
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                username: profile.username || profile.emails[0].value.split('@')[0],
                provider: 'facebook',
                facebook: profile._json,
                roles: ['authenticated']
            });
            user.save(function(err) {
                if (err) {
                    console.log(err);
                    return done(null, false, {
                        message: 'Facebook login failed, email already used by other login strategy'
                    });
                } else {
                    return done(err, user);
                }
            });
        });
    }
));

app.use(session({
    secret: config.session.key,
    cookie: {
        _expires: config.session.maxAge
    }
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// ROUTES
// ============================================================================

require('./server/modules/routes')(app, passport); // load our routes and pass in our app and fully configured passport


app.listen(port, function() {
    console.log('server listening on port ' + port);
});
