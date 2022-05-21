`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Check how many Jolty points you currently have`, // Description
    `\`jp\``, // Command examples
    1, // Minimum rank
    true, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      let jp = await Scripts.getJP(msg.author.id);
      msg.reply({
        content: `You have ${jp} Jolty points`,
        allowedMentions: { repliedUser: false },
      });
    }
  );
  return cmd;
};
