var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz_2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos
app.use( function(req, res, next) {
    // Guardar path en session.redir para despues del login
    if ( !req.path.match(/\/login|\/logout/) ) {
        req.session.redir = req.path;
    }

    // Hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

// MW para detectar inactividad y hacer logout
app.use ( function(req, res, next) {
    // Si se sobrepasan 2 minutos de inactividad DENTRO DE UNA SESION, destruir session

    if ( !req.session.user ) {
        // NO hay sesion establecida --> continuar sin hacer nada
        next();
        return;
    }

    // Hay sesion --> comprobamos tiempo de inactividad...

    var now = new Date();

    if ( req.session.timestamp ) {
        var timestamp = new Date(req.session.timestamp);
        var difTime = now.getTime()-timestamp.getTime();
        if ( difTime > 120000 ) {
            // se ha sobrepasado el tiempo de inactividad...
            console.log('Sobrepasado tiempo de inactividad...');
            delete req.session.user;
            delete req.session.timestamp;
            req.session.errors = [{"message": 'Su sesión ha caducado por inactividad...'}];
            res.redirect("/login");
            return;
        } 
    } 

    req.session.timestamp = now;
    next();
    
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}, 
        errors: []
    });
});


module.exports = app;
