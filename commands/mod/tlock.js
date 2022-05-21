`use strict`;

const Command = require("../Command");
const Database = require("../../db/Database");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Lock/unlock the bot in the server this command is used in`, // Description
    `\`tlock\``, // Command examples
    2, // Minimum rank
    false, // 'Extended Jolty Program' command
    false, // Direct Message enabled
    // Command execution >>
    (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      let _settings = Database.get("settings");
      let _tlocked = _settings.tlocked;
      if (_tlocked.indexOf(msg.guild.id) === -1) {
        _tlocked.push(msg.guild.id);
        msg.channel.send(
          `I have been locked in this server by <@${msg.author.id}>`
        );
      } else {
        _tlocked.splice(_tlocked.indexOf(msg.guild.id), 1);
        msg.channel.send(
          `I have been unlocked in this server by <@${msg.author.id}>`
        );
      }
      _settings.tlocked = _tlocked;
      Database.update("settings", _settings);
    }
  );
  return cmd;
};
