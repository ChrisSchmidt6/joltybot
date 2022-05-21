const { Client, Intents } = require("discord.js");
const mongoose = require("mongoose");
const Database = require("./db/Database");
const db = require("./db");
const Config = require("./config");
const setupScript = require("./scripts/setupScript");
const activityScript = require("./scripts/activityScript");

const INTENTS = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGES,
];
const PARTIALS = ["CHANNEL"]; // DM channels are not automatically cached, this is a workaround to read DMs off the bat

mongoose
  .connect(Config.database, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to database.");

    // Make sure the owner always has rank 4
    db.User.findOne({ disID: Config.owner }, { grank: 1 }, (err, data) => {
      if (err) console.log(err);
      else {
        if (data) {
          if (data.grank < 4) {
            db.User.updateOne(
              { disID: Config.owner },
              { $set: { grank: 4 } },
              console.error
            );
            console.log(`Owner db entry exists, rank had to be set to 4`);
          } else console.log(`Owner db entry exists and rank is good`);
        } else {
          new db.User({
            disID: Config.owner,
            grank: 4,
          }).save(console.error);
          console.log(`Owner db entry had to be created`);
        }
      }
    });

    // Clear out the temporary data
    db.TempUser.deleteMany().exec((err) => {
      if (err) console.error(err);
    });
    const bot = new Client({ intents: INTENTS, partials: PARTIALS });

    bot.login(Config.token);

    bot.once("ready", () => {
      console.log(
        `Connected Jolty to ${bot.guilds.cache.size} servers successfully ...`
      );
      bot.user.setActivity(`${Config.prefix}help`);
      let _settings = Database.get("settings");
      _settings.currentDate = new Date();
      Database.update("settings", _settings);
    });

    bot.on("messageCreate", async (msg) => {
      let notCommand = await setupScript.try(msg); // Had to make this await because it would return a promise instead of a boolean
      if (notCommand && msg.guildId !== null) {
        activityScript.check(msg); // If it isn't a command and is not a direct message, run activity script
      }
    });

    bot.on("disconnect", (err) => {
      console.log("There was an error with Jolty >>>");
      if (err.type == "close" && err.wasClean) {
        console.log("Suicided like you told me, sir.");
      } else console.log(err);
    });

    // Handling error event since the bot has previously crashed due to the lack of it
    bot.on("error", console.error);
  })
  .catch(console.error);
