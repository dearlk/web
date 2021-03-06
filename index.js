var express = require('express');
var path = require('path');
var fs = require('fs')
var morgan = require('morgan')
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

/*
var Ansible = require('node-ansible');
var command = new Ansible.AdHoc().hosts('all').module('ping');
var promise = command.exec();
promise.then(function(result) {
  console.log(result.output);
  console.log(result.code);
})
*/


// create express app
var app = express();
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse requests of content-type - application/json
app.use(bodyParser.json())

// Configuring the database
var dbConfig = require('./config/database.config.js');
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url);
mongoose.connection.once('open', function() {
    console.log("Successfully connected to the database");
})
var db = mongoose.connection;

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));




app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'dearlk-web.log'), {flags: 'a'});
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// Require Main routes
var routes = require('./routes/router.js');
app.use ('/',routes);




// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});





// listen for requests
app.listen(3000, function(){
    console.log("dearlk.com Web Server is listening on port 3000...");
});
