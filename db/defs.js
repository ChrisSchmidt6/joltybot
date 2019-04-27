`use strict`

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

let defSchema = mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  author: {
    type: String,
    required: true
  },
  authorID: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

let Def = module.exports = mongoose.model('Def', defSchema);