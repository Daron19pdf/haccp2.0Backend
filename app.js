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
const cors = require('cors');

var app = express();

// Middleware pour CORS
app.use(cors({
  origin: '*', // Ou spécifie l'URL de ton client
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware pour traiter les fichiers
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB par exemple
}));

// Middleware pour analyser les données JSON
app.use(bodyParser.json());
// Middleware pour analyser les données de type multipart/form-data
app.use(bodyParser.urlencoded({ extended: true }));

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
