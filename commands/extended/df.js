`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");
const db = require("../../db");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    // Description >>
    `List the words you have defined, get a definition of an already-defined word, define a word that has not yet been claimed (50 JP), or redefine an already-defined word (300 JP)`,
    // Command examples >>
    `\`df list\`\n\`df get <word>\`\n\`df set <word> as <definition>\`\n\`df reset <word> as <definition>\``,
    1, // Minimum rank
    true, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      switch (args[1]) {
        case "list":
          if (args.length > 2) {
            callback(getError(msg, args));
            break;
          }
          var user = await Scripts.getUser(msg.author.id);
          if (user.definitions.length === 0) {
            msg.reply({
              content: `You do not currently have anything defined`,
              allowedMentions: { repliedUser: false },
            });
            return;
          }
          let definitions = "";
          for (let i = 0; i < user.definitions.length; i++) {
            definitions += `\`${user.definitions[i]}\`, `;
          }
          definitions = definitions.slice(0, -2);
          msg.reply({
            content: `You have defined the following words\n${definitions}`,
            allowedMentions: { repliedUser: false },
          });
          break;
        case "get":
          if (args.length > 3) {
            callback(getError(msg, args));
            break;
          }
          var word = args[2].toLowerCase();
          var definition = await Scripts.getDef(word);
          if (!definition) {
            msg.reply({
              content: `There is no definition for \`${word}\` yet`,
              allowedMentions: { repliedUser: false },
            });
            return;
          }
          msg.reply({
            content: `\`${definition.author}\` defined \`${word}\` as: ${definition.description}`,
            allowedMentions: { repliedUser: false },
          });
          break;
        case "set":
          if (args[3] !== "as") {
            callback(getError(msg, args));
            break;
          }
          var word = args[2].toLowerCase();
          var definition = await Scripts.getDef(word);
          var user = await Scripts.getUser(msg.author.id);
          if (definition) {
            msg.reply({
              content: `\`${word}\` has already been defined`,
              allowedMentions: { repliedUser: false },
            });
            break;
          }
          var cost = 50;
          if (user.jp < cost) {
            callback(`You don't have enough Jolty points`);
            break;
          }
          var description = msg.content.slice(msg.content.indexOf(" as ") + 4);
          user.jp -= cost;
          user.definitions.push(word);
          db.User.updateOne(
            { disID: msg.author.id },
            { $set: { jp: user.jp, definitions: user.definitions } },
            (err) => {
              if (err) console.log(err);
              else {
                new db.Def({
                  word: word,
                  author: msg.author.username + "#" + msg.author.discriminator,
                  authorID: msg.author.id,
                  avatar: msg.author.avatarURL,
                  description: description,
                  timestamp: new Date(),
                }).save((err) => {
                  if (err) console.log(err);
                });
                msg.reply({
                  content: `You have defined \`${word}\` as \`${description}\` for ${cost} Jolty points`,
                  allowedMentions: { repliedUser: false },
                });
              }
            }
          );
          break;
        case "reset":
          if (args[3] !== "as") {
            callback(getError(msg, args));
            break;
          }
          var word = args[2].toLowerCase();
          var definition = await Scripts.getDef(word);
          if (!definition) {
            msg.reply({
              content: `There is no definition for \`${word}\` yet`,
              allowedMentions: { repliedUser: false },
            });
            break;
          }
          var cost = 300;
          var user = await Scripts.getUser(msg.author.id);
          if (user.jp < cost) {
            callback(`You don't have enough Jolty points`);
            break;
          }
          var description = msg.content.slice(msg.content.indexOf(" as ") + 4);
          user.jp -= cost;
          user.definitions.push(word);
          db.User.updateOne(
            { disID: msg.author.id },
            { $set: { jp: user.jp, definitions: user.definitions } },
            (err) => {
              if (err) console.log(err);
              else {
                db.Def.updateOne(
                  { word: word },
                  {
                    $set: {
                      author:
                        msg.author.username + "#" + msg.author.discriminator,
                      authorID: msg.author.id,
                      avatar: msg.author.avatarURL,
                      description: description,
                      timestamp: new Date(),
                    },
                  },
                  (err) => {
                    if (err) console.log(err);
                  }
                );
                msg.reply({
                  content: `You have redefined \`${word}\` as: \n\`${description}\` for ${cost} Jolty points`,
                  allowedMentions: { repliedUser: false },
                });
              }
            }
          );
          var otherUser = await Scripts.getUser(definition.authorID);
          if (otherUser) {
            let wordCount = otherUser.definitions.reduce(
              (n, x) => n + (x === word),
              0
            );
            if (msg.author.id === otherUser.disID && wordCount > 1)
              otherUser.definitions.splice(
                otherUser.definitions.indexOf(word),
                1
              );
            else if (msg.author.id !== otherUser.disID)
              otherUser.definitions.splice(
                otherUser.definitions.indexOf(word),
                1
              );
            db.User.updateOne(
              { disID: otherUser.disID },
              { $set: { definitions: otherUser.definitions } },
              (err) => {
                if (err) console.log(err);
              }
            );
          }
          break;
        default:
          callback(getError(msg, args));
          break;
      }
      return;
    }
  );
  return cmd;
};
