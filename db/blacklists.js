`use strict`

const mongoose = require('mongoose');

let blacklistSchema = mongoose.Schema({
  _id: {
    type: String,
    auto: false,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now()
  },
  completedBy: {
    type: Array,
    required: true
  }
});

let Blacklist = module.exports = mongoose.model('Blacklist', blacklistSchema);