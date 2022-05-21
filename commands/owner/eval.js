`use strict`;

const Command = require("../Command");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let clean = (text) => {
    if (typeof text === "string") {
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
      return text;
    }
  };

  let cmd = new Command(
    "Evaluate code", // Description
    "\`eval <code>\`", // Command examples
    4, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    (msg, args, callback) => {
      if (args.length < 2) {
        callback(getError(msg, args));
        return;
      }
      try {
        let evaled = eval(msg.content.slice(msg.content.indexOf(" ") + 1));
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
        msg.reply({
          content: `\`\`\`js\n${clean(evaled)}\n\`\`\``,
          allowedMentions: { repliedUser: false },
        });
        return;
      } catch (err) {
        msg.reply({
          content: `\`CODE ERROR\` \n\`${clean(err)}\``,
          allowedMentions: { repliedUser: false },
        });
        return;
      }
    }
  );

  return cmd;
};
