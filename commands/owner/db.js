`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");

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
    "Get DB info quickly (not used to make DB changes)", // Description
    "\`db <collection> <search>\`", // Command examples
    4, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length < 3 || args.length > 3) {
        callback(getError(msg, args));
        return;
      }
      try {
        let collection = args[1].toLowerCase();
        let search = args[2];
        let returnInfo = "";
        switch (collection) {
          case "user":
            returnInfo = await Scripts.getUser(search);
            break;
          case "defs":
            returnInfo = await Scripts.getDef(search);
            break;
          case "polls":
            returnInfo = await Scripts.getPoll(search);
            break;
          default:
            callback("Unable to find that collection in the DB");
            return;
        }
        msg.reply({
          content: `\`\`\`js\n${returnInfo}\n\`\`\``,
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
