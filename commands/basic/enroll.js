`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const db = require("../../db");
const Scripts = require("../../scripts");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Sign up for the extended Jolty program (allows access to Jolty points and numerous other commands)`, // Description
    `\`enroll\``, // Command examples
    1, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      let user = await Scripts.getUser(msg.author.id);
      if (user) {
        callback(`You are already enrolled in the extended Jolty program`);
        return;
      }
      new db.User({
        disID: msg.author.id,
      }).save((err) => {
        if (err) console.log(err);
        else {
          let cmds = require("../extended").getCommands({});
          let userCmds = ``;
          for (cmd in cmds) userCmds += `\`${cmd}\`, `;
          msg.reply({
            content: `You have enrolled! You now have access to the following additional commands:\n${userCmds.slice(
              0,
              -2
            )}\nTo get help with any of them, use the command __\`${
              Config.prefix
            }help <cmd>\`__`,
            allowedMentions: { repliedUser: false },
          });
        }
        return;
      });
    }
  );
  return cmd;
};
