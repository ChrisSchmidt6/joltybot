`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");
const db = require("../../db");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Let people know about yourself or use it for something like friend codes and gamertags`, // Description
    `\`bio set <bio goes here>\`\n\`bio view <@user>\` (Not enabled in Direct Messages)`, // Command examples
    1, // Minimum rank
    true, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length <= 2) {
        callback(getError(msg, args));
        return;
      }
      let method = args[1].toLowerCase();
      switch (method) {
        case "set":
          let bio = msg.content.slice(msg.content.indexOf(args[2]));
          db.User.updateOne(
            { disID: msg.author.id },
            { $set: { bio: bio } },
            (err) => {
              if (err) msg.reply(`\`\`\`js${err}\`\`\``);
              else {
                msg.reply({
                  content: `You have set your bio to:\n\`${bio}\``,
                  allowedMentions: { repliedUser: false },
                });
              }
            }
          );
          break;
        case "view":
          // In case of direct message, ignore
          if(msg.guildId === null){
            callback(`You can not view someone's bio via Direct Messages.`);
            return;
          }
          let user = args[2];
          if (user.slice(0, 2) !== "<@" && user.slice(-1) !== ">") {
            callback(`You must specify someone using "@user"`);
            return;
          }
          // Seeing as @mentions are displayed as <@number> we gotta pull some tricks to get the ID.
          user = user.slice(2, -1);
          // Sometimes IDs have a ! in front for no reason, so we gotta check for that too and get rid of it.
          if (user.slice(0, 1) === "!") user = user.slice(1);
          // Check bot's DB for user's Discord ID, if it doesn't exist it will return false
          userInfo = await Scripts.getUser(user);
          let targetUser = await msg.guild.members.fetch(user);
          if (!targetUser) {
            callback(
              `The person you specified either doesn't exist, or is not in this server`
            );
            return;
          }
          if (!userInfo) {
            callback(`The person you specified is not whitelisted`);
            return;
          }
          if (userInfo.bio.length === 0) {
            msg.reply({
              content: `${targetUser.displayName} does not have a bio set.`,
              allowedMentions: { repliedUser: false },
            });
            return;
          }
          msg.reply({
            content: `Here is ${targetUser.displayName}'s bio as requested:\n\`${userInfo.bio}\``,
            allowedMentions: { repliedUser: false },
          });
          break;
        default:
          callback(getError(msg, args));
          return;
      }
      return;
    }
  );
  return cmd;
};
