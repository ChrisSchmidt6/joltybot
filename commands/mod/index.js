`use strict`;

const fs = require('fs');
const path = require('path');

module.exports.getCommands = cmds => {
  const modelsPath = path.resolve(__dirname)
  fs.readdirSync(modelsPath).forEach(file => {
    if(file !== 'index.js'){
      cmds[file.slice(0, 1) + file.slice(1, -3)] = require(modelsPath + '/' + file).create(cmds);
    }
  });
  return cmds;
}