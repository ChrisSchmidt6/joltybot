`use strict`;

const Command = require("../Command");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    // Description >>
    "Stop the bot with a command. Usually in emergencies or because of laziness",
    "\`sui\`", // Command examples
    4, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    (msg, args, callback) => {
      if (args.length > 1) {
        callback(getError(msg, args));
        return;
      }
      msg.channel.send("Good night everyone.").then(() => {
        msg.client.destroy();
        process.exit();
      });
    }
  );
  return cmd;
};
