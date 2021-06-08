`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");
const db = require('../../db');

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`List the words you have defined, get a definition of an already-defined word, define a word that has not yet been claimed (50 JP), or redefine an already-defined word (300 JP)`, `\ndf list\ndf get <word>\ndf set <word> as <definition>\ndf reset <word> as <definition>`, 1, true, async (msg, args, callback) => {
        switch(args[1]){
          case "list":
            if(args.length > 2){ callback(getError(args[0].slice(Config.prefix.length))); break; }
            var user = await Scripts.getUser(msg.author.id);
            if(user.definitions.length === 0){ msg.channel.send(`${msg.member.nickname || msg.author.username}: you do not currently have anything defined`); return; }
            let definitions = "";
            for(let i = 0; i < user.definitions.length; i++){ definitions += `\`${user.definitions[i]}\`, `; }
            definitions = definitions.slice(0, -2);
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You have defined the following words\n${definitions}`);
            break;
          case "get":
            if(args.length > 3){ callback(getError(args[0].slice(Config.prefix.length))); break; }
            var word = args[2].toLowerCase();
            var definition = await Scripts.getDef(word);
            if(!definition){ msg.channel.send(`${msg.member.nickname || msg.author.username}: There is no definition for \`${word}\` yet`); return; }
            msg.channel.send(`\`${definition.author}\` defined \`${word}\` as: ${definition.description}`);
            break;
          case "set":
            if(args[3] !== "as"){ callback(getError(args[0].slice(Config.prefix.length))); break; }
            var word = args[2].toLowerCase();
            var definition = await Scripts.getDef(word);
            var user = await Scripts.getUser(msg.author.id);
            if(definition){ msg.channel.send(`${msg.member.nickname || msg.author.username}: \`${word}\` has already been defined`); break; }
            var cost = 50;
            if(user.jp < cost){ callback(`You don't have enough Jolty points`); break; }
            var description = msg.content.slice(msg.content.indexOf(" as ") + 4);
            user.jp -= cost;
            user.definitions.push(word);
            db.User.updateOne({disID: msg.author.id}, {$set: {jp: user.jp, definitions: user.definitions}}, (err) => {
              if(err) console.log(err);
              else{
                new db.Def({
                  word: word,
                  author: msg.author.username + "#" + msg.author.discriminator,
                  authorID: msg.author.id,
                  avatar: msg.author.avatarURL,
                  description: description,
                  timestamp: new Date()
                }).save(err => {
                  if(err) console.log(err);
                });
                msg.channel.send(`${msg.member.nickname || msg.author.username}: You have defined \`${word}\` as \`${description}\` for ${cost} Jolty points`);
              }
            });
            break;
          case "reset":
            if(args[3] !== "as"){ callback(getError(args[0].slice(Config.prefix.length))); break; }
            var word = args[2].toLowerCase();
            var definition = await Scripts.getDef(word);
            if(!definition){ msg.channel.send(`${msg.member.nickname || msg.author.username}: There is no definition for \`${word}\` yet`); break; }
            var cost = 300;
            var user = await Scripts.getUser(msg.author.id);
            if(user.jp < cost){ callback(`You don't have enough Jolty points`); break; }
            var description = msg.content.slice(msg.content.indexOf(" as ") + 4);
            user.jp -= cost;
            user.definitions.push(word);
            db.User.updateOne({disID: msg.author.id}, {$set: {jp: user.jp, definitions: user.definitions}}, (err) => {
              if(err) console.log(err);
              else{
                db.Def.updateOne({word: word}, {$set: {
                  author: msg.author.username + "#" + msg.author.discriminator,
                  authorID: msg.author.id,
                  avatar: msg.author.avatarURL,
                  description: description,
                  timestamp: new Date()
                }}, (err) => {
                  if(err) console.log(err);
                });
                msg.channel.send(`${msg.member.nickname || msg.author.username}: You have redefined \`${word}\` as: \n\`${description}\` for ${cost} Jolty points`);
              }
            });
            var otherUser = await Scripts.getUser(definition.authorID);
            if(otherUser){
              let wordCount = otherUser.definitions.reduce((n, x) => n + (x === word), 0);
              if(msg.author.id === otherUser.disID && wordCount > 1) otherUser.definitions.splice(otherUser.definitions.indexOf(word), 1);
              else if(msg.author.id !== otherUser.disID) otherUser.definitions.splice(otherUser.definitions.indexOf(word), 1);
              db.User.updateOne({disID: otherUser.disID}, {$set: {definitions: otherUser.definitions}}, (err) => {
                if(err) console.log(err);
              });
            }
            break;
          default:
            callback(getError(args[0].slice(Config.prefix.length)));
            break;
        }
        return;
    });
    return cmd;
}