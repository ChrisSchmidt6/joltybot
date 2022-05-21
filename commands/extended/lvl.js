`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `See what level you have reached`, // Description
    `\`lvl\``, // Command examples
    1, // Minimum rank
    true, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      let user = await Scripts.getUser(msg.author.id);
      let lvl = user.lvl;
      let xp = user.xp;
      let xpArray = require("../../scripts/activityScript").xpArray;
      let xpLeft = xpArray[lvl - 1] - xp;
      msg.reply({
        content: `You are level \`${lvl}\`, with \`${xp}\` total XP.\nYou need \`${xpLeft}\` more XP to level up`,
        allowedMentions: { repliedUser: false },
      });
    }
  );
  return cmd;
};
