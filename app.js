var express = require('express'),
    session = require('express-session'),
    // FileStore = require('session-file-store')(session),
    bodyParser = require('body-parser'),
    md5 = require('md5'),
    path = require('path'),
    fs = require('fs'),
    config = require('./config/config'),
    app = express();

var enforce = require('express-sslify');

if(config.system.sentry_dns) {
    const Sentry = require('@sentry/node');
    Sentry.init({dsn: config.system.sentry_dns});
}

var curl = require('node-libcurl').Curl;

var compression = require('compression');
app.use(compression());

var http = require('http').Server(app);
var serverPort = config.system.serverPort;

var io = require('socket.io')(http);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

io.on('connection', function(socket){
    console.log('a user connected');


    socket.on('joinroom', function(room, fn) {
        socket.join(room)
        fn('JOINED')
    })

    socket.on('comment idan taskmanagement', function(msg) {
        socket.broadcast.emit('ferretback', msg)
    })

    socket.on('changedcampaignstatus', function (room, data) {
        socket.broadcast.emit('changedcampaignstatusback', room, data)
    })

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('ezond message', function(msg){
        io.emit('ezond message', msg);
    });
});

//set path to the views (template) directory
app.set('views', path.join(__dirname, '/views'));

// Use EJS Templating engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Set public folder to server static files
app.use(express.static(path.join(__dirname, 'public')));


var sessionData = {
    genid: function(req) {
        var d = new Date();
        return md5("randomkey"+d.getTime());
    },
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { expires: new Date(2147483647000)}
};

if(config.system.redis_url) {
    var redis = require('redis');
    var redisStore = require('connect-redis')(session);
    var client = redis.createClient(config.system.redis_url);

    sessionData.store = new redisStore({client: client});
}

// Use Session middleware
app.use(session(sessionData));

// Attach body parser middleware for post and json
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

if(config.system.environment == 'production') {
    app.use(enforce.HTTPS({trustProtoHeader: true}));
}

// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function(file) {
    if (file.substr(-3) === '.js') {
        route = require('./controllers/' + file);
        route.controller(app);
        // console.log(file)
    }
});


http.listen(serverPort, function () {
    console.log('Webserver listening on port: ' + serverPort);
});
