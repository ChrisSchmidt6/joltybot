`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");
const db = require("../../db");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    // Description >>
    `Blacklist/unblacklist a guild (You MUST provide a reason)`,
    // Command examples >>
    `\`bl-guild <guild id>\` (When unblacklisting a guild)\n\`bl-guild <guild id> <reason>\` (When blacklisting a guild)`,
    3, // Minimum rank
    false, //
    true, // Direct Message enabled
    // Command execution >>
    (msg, args, callback) => {
      if (args.length < 3) {
        callback(getError(msg, args));
        return;
      }
      msg.reply({
        content: `This command is a work in progress.`,
        allowedMentions: { repliedUser: false },
      });
    }
  );

  return cmd;
};
