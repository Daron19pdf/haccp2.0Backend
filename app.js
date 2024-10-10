var express = require('express');
require('dotenv').config();
require('./models/connection');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var equipementRouter = require('./routes/equipement');
var saveDataRouter = require('./routes/saveData');

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

var app = express();

// Middleware pour analyser les données JSON
app.use(bodyParser.json());
// Middleware pour analyser les données de type multipart/form-data
app.use(bodyParser.urlencoded({ extended: true }));


app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/equipement', equipementRouter);
app.use('/saveData', saveDataRouter);


module.exports = app;
