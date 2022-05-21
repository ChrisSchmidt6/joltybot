`use strict`;

const Command = require("../Command");
const db = require("../../db");
const moment = require("moment");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let startDate = new Date();
  let cmd = new Command(
    `Show Jolty's statistics off`, // Description
    `\`stats\``, // Command examples
    2, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      let bot = msg.client;
      let ut = moment(startDate).startOf("minute").fromNow();
      db.User.find({}, (err, data) => {
        if (err) console.log(err);
        else {
          if (!data)
            msg.reply({
              content: `I have been running for \`${ut.slice(
                0,
                ut.indexOf(" ago")
              )}\`\nI am in \`${
                bot.guilds.cache.size
              }\` servers with a total of \`0\` whitelisted people using me`,
              allowedMentions: { repliedUser: false },
            });
          else
            msg.reply({
              content: `I have been running for \`${ut.slice(
                0,
                ut.indexOf(" ago")
              )}\`\nI am in \`${
                bot.guilds.cache.size
              }\` servers with a total of \`${
                Object.keys(data).length
              }\` whitelisted people using me`,
              allowedMentions: { repliedUser: false },
            });
        }
      });
    }
  );
  return cmd;
};
