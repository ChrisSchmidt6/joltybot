`use strict`;

const fs = require("fs");

module.exports.update = (name, db) =>{
  try {
    fs.writeFile(`${__dirname}/${name}.json`, JSON.stringify(db), (error) => {if(error) console.log(error);});
    return false;
  } catch (err) {
    return err;
  }
}

module.exports.get = (db) => {
  try {
    if(db === "settings") return JSON.parse(fs.readFileSync(`${__dirname}/settings.json`, 'utf8'));
    return false;
  } catch (err) {
    return err;
  }
}
