`use strict`

const mongoose = require('mongoose');

let tempUserSchema = mongoose.Schema({
  _id: {
    type: String,
    auto: false,
    required: true
  },
  thisInterval: {
    type: Number,
    required: true,
    default: 0
  },
  thisHour: {
    type: Number,
    required: true,
    default: 0
  },
  consecutive: {
    type: Number,
    required: true,
    default: 0
  },
  intervalDate: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

let TempUser = module.exports = mongoose.model('TempUser', tempUserSchema);