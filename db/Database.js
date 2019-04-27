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
    if(db === "users") return JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
    if(db === "defs") return JSON.parse(fs.readFileSync(`${__dirname}/definitions.json`, 'utf8'));
    if(db === "blist") return JSON.parse(fs.readFileSync(`${__dirname}/blacklist.json`, 'utf8'));
    if(db === "guilds") return JSON.parse(fs.readFileSync(`${__dirname}/guilds.json`, 'utf8'));
    if(db === "polls") return JSON.parse(fs.readFileSync(`${__dirname}/polls.json`, 'utf8'));
    if(db === "settings") return JSON.parse(fs.readFileSync(`${__dirname}/settings.json`, 'utf8'));
    if(db === "temp") return JSON.parse(fs.readFileSync(`${__dirname}/temp.json`, 'utf8'));
    return false;
  } catch (err) {
    return err;
  }
}
