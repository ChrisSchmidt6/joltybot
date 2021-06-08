`use strict`;

const Config = require("../../config");
const Command = require("../Command");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Clear between 5 and 100 messages (defaults to 100) or clear all messages in a channel (can't clear all in the general text channel)`, `clear\nclear -a\nclear <integer between 5 and 100>`, 2, false, (msg, args, callback) => {
        if(args.length > 3){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        if(args.length === 1){
          msg.channel.bulkDelete(100).then((messages) => {
            msg.channel.send(`Deleted 100 messages - <@${msg.author.id}>`)
          }).catch((e) => {
            callback(`Couldn't delete that many messages - error printed in console. Remember messages 14 days or older can't be deleted!`); return;
          });
        }else{
          if(args[1] !== "-a" && args[1] != parseInt(args[1])){ callback(getError(args[0].slice(Config.prefix.length))); return; }
          if(args[1] == parseInt(args[1])){
            if(args[1] < 5 || args[1] > 100){ callback(`You can only delete between 5 and 100 messages at a time.`); return; }
            msg.channel.bulkDelete(args[1]).then((messages) => {
              msg.channel.send(`Deleted ${messages.size} messages - <@${msg.author.id}>`)
            }).catch((e) => {
              callback(`Couldn't delete that many messages - error printed in console. Remember messages 14 days or older can't be deleted!`); return;
            });
          }else{
            if(msg.channel.id === msg.guild.id){ callback(getError(args[0].slice(Config.prefix.length))); return; }
            let ch = msg.channel;
            try{
              msg.member.guild.createChannel(ch.name, ch.type, ch.permissionOverwrites)
                .then(newCh => newCh.send(`Cleared the entire channel - <@${msg.author.id}>`))
                .catch(console.error);
              ch.delete();
              msg.channel.send()
            }catch(err){
              callback(`It seems there are some permission issues`);
              console.log(err);
              return;
            }
          }
        }
    });
    return cmd;
}