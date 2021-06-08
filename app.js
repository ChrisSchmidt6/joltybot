const Discord = require('discord.js');
const bot = new Discord.Client();
const mongoose = require('mongoose');
const Database = require("./db/Database");
const db = require('./db');
const Config = require("./config");
const setupScript = require("./scripts/setupScript");
const activityScript = require("./scripts/activityScript");

mongoose.connect(Config.database, { useNewUrlParser: true })
    .then(() => console.log('Connected to database.'))
    .catch(err => console.log(err));

// Make sure the owner always has rank 4
db.User.findOne({disID: Config.owner}, {grank: 1}, (err,data) => {
  if(err) console.log(err);
  else{
    if(data){
      if(data.grank < 4){
        db.User.updateOne({disID: Config.owner}, {$set: {grank: 4}}, (err) => {
          if(err) console.log(err);
        });
      }
    }else{
      new db.User({
        disID: Config.owner,
        grank: 4
      }).save(err => {
        if(err) console.log(err);
      })
    }
  }
});

// Clear out the temporary data
db.TempUser.deleteOne().exec(err => {
  if(err) console.log(err);
});
db.TempPoll.deleteOne().exec(err => {
  if(err) console.log(err);
});

bot.on("ready", () => {
  console.log(`Connected Jolty to ${ bot.guilds.cache.size } servers successfully ...`);
  bot.user.setActivity(`${Config.prefix}help`);
  let _settings = Database.get("settings");
  _settings.currentDate = new Date();
  Database.update("settings", _settings);
});

bot.on("message", async (msg) => {
  let notCommand = await setupScript.try(msg); // Had to make this await because it would return a promise instead of a boolean
  if(notCommand){
    activityScript.check(msg); // If it isn't a command, run activity script
  }
});

bot.on("disconnect", err => {
  console.log("There was an error with Jolty >>>");
  if(err.type == "close" && err.wasClean) console.log("Suicided like you told me, sir.");
  else console.log(err);
});

// Handling error event since the bot has previously crashed due to the lack of it
bot.on('error', console.error);

bot.login(Config.token);