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

var app = express();

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
