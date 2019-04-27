`use strict`

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

let userSchema = mongoose.Schema({
  disID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  grank: {
    type: Number,
    required: true,
    default: 1
  },
  rankBy: {
    type: String,
    required: true,
    default: 'System'
  },
  lvl: {
    type: Number,
    required: true,
    default: 1
  },
  xp: {
    type: Number,
    required: true,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  jp: {
      type: Number,
      required: true,
      default: 0
  },
  definitions: {
      type: Array,
      required: true,
      default: []
  }
});

let User = module.exports = mongoose.model('User', userSchema);