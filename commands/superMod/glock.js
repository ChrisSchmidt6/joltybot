`use strict`;

const Command = require("../Command");
const Database = require("../../db/Database");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Lock/unlock the bot globally`, // Description
    `\`glock\``, // Command examples
    3, // Minimum rank
    false, // 
    true, // Direct Message enabled
    // Command execution >>
    (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      let _settings = Database.get("settings");
      if (!_settings["locked"]) {
        _settings["locked"] = true;
        msg.reply({
          content: `I have been globally locked`,
          allowedMentions: { repliedUser: false },
        });
      } else {
        _settings["locked"] = false;
        msg.reply({
          content: `I have been globally unlocked`,
          allowedMentions: { repliedUser: false },
        });
      }
      Database.update("settings", _settings);
    }
  );
  return cmd;
};
