`use strict`;

const Command = require("../Command");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Get your Discord ID`, // Description
    `\`id\``, // Command examples
    1, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      msg.reply({
        content: `Your Discord ID is \`${msg.author.id}\``,
        allowedMentions: { repliedUser: false },
      });
    }
  );
  return cmd;
};
