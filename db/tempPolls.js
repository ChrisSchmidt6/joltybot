`use strict`

const mongoose = require('mongoose');

let tempPollSchema = mongoose.Schema({
  _id: {
    type: String,
    auto: false,
    required: true
  },
  authorID: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  voters: {
    type: Array,
    required: true
  },
  embed: {
    type: Object,
    required: true
  }
});

let TempPoll = module.exports = mongoose.model('TempPoll', tempPollSchema);