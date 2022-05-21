`use strict`;

const Database = require("../db/Database");
const db = require("../db");
const Scripts = require("./");
const Config = require("../config");
const cmds = require("../commands");

module.exports.try = async (msg) => {
  if (msg.author.bot) return false;

  const blacklisted = await Scripts.getBlacklist("user", msg.author.id);
  if (blacklisted) return;

  let rank = await Scripts.getRank(msg.author.id);

  if (rank < 1) return;

  if (rank < 3 && Database.get("settings")["locked"]) return;

  const messageIsDirect = msg.guildId === null;

  let args = msg.content.split(" ");

  let cmd = args[0];

  // If message was sent in a guild (not a DM), we need additional checks :
  if (!messageIsDirect) {
    // Give user access to additional commands based on guild permissions
    if (msg.member.permissions.has("KICK_MEMBERS") && rank === 1) rank = 2;
    if (rank < 3) {
      if (Database.get("settings").tlocked.indexOf(msg.guildId) > -1) return;
    }
    if (cmd.slice(0, Config.prefix.length).toLowerCase() !== Config.prefix) {
      return true;
    }
    cmd = cmd.slice(Config.prefix.length); // in guilds, prefix is required so it should be removed from the command
  }

  if (cmds[cmd]) {
    console.log(
      `${msg.author.tag} used ${cmd} in ${
        messageIsDirect ? "Direct Messages" : "Guild " + msg.guildId
      }`
    );
    db.User.findOne({ disID: msg.author.id }, { _id: 1 }, (err, data) => {
      if (err) {
        console.log(err);
        return;
      } else {
        let callback = (err) => {
          msg.reply({
            content: `\`ERROR\`\n${err}`,
            allowedMentions: { repliedUser: false },
          });
          return;
        };

        if (cmds[cmd].canUse(rank) && data) {
          if (!messageIsDirect) {
            cmds[cmd].execute(msg, args, callback);
          } else {
            if (cmds[cmd].dmEnabled) {
              cmds[cmd].execute(msg, args, callback);
            } else {
              msg.reply({
                content: `This command is not enabled in Direct Messages.`,
                allowedMentions: { repliedUser: false },
              });
            }
          }
        } else {
          if (!cmds[cmd].canUse(rank)) {
            msg.reply({
              content: `You do not have a high enough rank to use this command`,
              allowedMentions: { repliedUser: false },
            });
            return;
          } else if (cmds[cmd].extProgram) {
            msg.reply({
              content: `${
                msg.member.nickname || msg.author.username
              }: You are not enrolled in the extended Jolty program. To enroll, type \`${
                Config.prefix
              }enroll\` It's free, why not?`,
              allowedMentions: { repliedUser: false },
            });
            return;
          }
          if (!messageIsDirect) {
            cmds[cmd].execute(msg, args, callback);
          } else {
            if (cmds[cmd].dmEnabled) {
              cmds[cmd].execute(msg, args, callback);
            } else {
              msg.reply({
                content: `This command is not enabled in Direct Messages.`,
                allowedMentions: { repliedUser: false },
              });
            }
          }
        }
      }
    });
  }
};
