


import { connect } from 'mongoose';

require("dotenv").config();

const CONNECTION_STRING = process.env.CONNECTION_STRING;

connect(CONNECTION_STRING, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));