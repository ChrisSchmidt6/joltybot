`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");
const db = require("../../db");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Blacklist/unblacklist a user (You MUST provide a reason)`, // Description
    `\`bl-user <@user>\` (When unblacklisting someone)\n\`bl-user <@user> <reason>\` (When blacklisting someone)`, // Command examples
    3, // Minimum rank
    false, // 
    false, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length < 2) {
        callback(getError(msg, args));
        return;
      }
      let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (args[1].slice(0, 2) !== "<@" && args[1].slice(-1) !== ">") {
        callback(`You must specify someone using "@user"`);
        return;
      }
      args[1] = args[1].slice(2, -1);
      if (args[1].slice(0, 1) === "!") args[1] = args[1].slice(1);
      if (args[1].length !== 18) {
        callback(`You must specify someone using "@user"`);
        return;
      }
      for (var i = 0; i < args[1].length; i++) {
        var isNumber = false;
        for (var z = 0; z < numbers.length; z++) {
          if (args[1].slice(i, i + 1).indexOf(numbers[z]) > -1) isNumber = true;
        }
        if (!isNumber) {
          callback(`You did not mention a real user`);
          return;
        }
      }
      if (!msg.guild.member(args[1])) {
        callback(
          `The person you specified either doesn't exist, or is not in this server`
        );
        return;
      }
      if (args[1] === msg.author.id) {
        callback(`Luckily for you, you can't blacklist yourself`);
        return;
      }
      let user = await Scripts.getUser(args[1]);
      let self = await Scripts.getUser(msg.author.id);
      let blacklist = await Scripts.getBlacklist("user", user.disID);
      if (user)
        if (self.grank <= user.grank) {
          callback(`You aren't a high enough rank to blacklist this person`);
          return;
        }
      if (!blacklist) {
        if (args.length < 3) {
          callback(`You must include a reason when blacklisting someone!`);
          return;
        }
        let BlUser = new db.Blacklist({
          _id: user.disID,
          type: "user",
          reason: msg.content.slice(msg.content.indexOf(args[2])),
          completedBy: [
            msg.author.username + "#" + msg.author.discriminator,
            msg.author.id,
          ],
        });
        BlUser.save((err) => {
          if (err) console.log(err);
          else
            msg.reply({
              content: `I have blacklisted <@${user.disID}>`,
              allowedMentions: { repliedUser: false },
            });
        });
      } else {
        db.Blacklist.deleteOne({ _id: user.disID }, (err) => {
          if (err) console.log(err);
        });
        msg.reply({
          content: `I have unblacklisted <@${user.disID}>`,
          allowedMentions: { repliedUser: false },
        });
      }
    }
  );
  return cmd;
};
