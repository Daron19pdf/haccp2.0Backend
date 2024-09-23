const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  token: String,
  equipement : {type: mongoose.Schema.Types.ObjectId, ref: 'Equipement'},
  saveData: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SaveData' }]
});

const User = mongoose.model('users', userSchema);

module.exports = User;