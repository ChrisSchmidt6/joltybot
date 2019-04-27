`use strict`;

const Command = require("./Command");
const Database = require("../db/Database");
const db = require("../db");
const Config = require("../config");
const moment = require("moment");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

let startDate = new Date();

module.exports.getCommands = cmds => {

  cmds["tlock"] = new Command(`Lock/unlock the bot in this server`, `tlock`, 2, false, (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let _settings = Database.get("settings");
    let _tlocked = _settings.tlocked;
    if(_tlocked.indexOf(msg.guild.id) === -1){
      _tlocked.push(msg.guild.id);
      msg.channel.send(`I have been locked by <@${msg.author.id}>`);
    }else{
      _tlocked.splice(_tlocked.indexOf(msg.guild.id), 1);
      msg.channel.send(`I have been unlocked by <@${msg.author.id}>`);
    }
    _settings.tlocked = _tlocked;
    Database.update("settings", _settings);
  });

  cmds["clear"] = new Command(`Clear between 5 and 100 messages (defaults to 100) or clear all messages in a channel (can't clear all in the general text channel)`, `clear\nclear -a\nclear <integer between 5 and 100>`, 2, false, (msg, args, callback) => {
    if(args.length > 3){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    if(args.length === 1){
      msg.channel.bulkDelete(100).then((messages) => {
        msg.channel.send(`Deleted 100 messages - <@${msg.author.id}>`)
      }).catch((e) => {
        console.log(e.response.text);
        callback(`Couldn't delete that many messages - error printed in console. Remember messages 14 days or older can't be deleted!`); return;
      });
    }else{
      if(args[1] !== "-a" && args[1] != parseInt(args[1])){ callback(getError(args[0].slice(Config.prefix.length))); return; }
      if(args[1] == parseInt(args[1])){
        if(args[1] < 5 || args[1] > 100){ callback(`You can only delete between 5 and 100 messages at a time.`); return; }
        msg.channel.bulkDelete(args[1]).then((messages) => {
          msg.channel.send(`Deleted ${messages.size} messages - <@${msg.author.id}>`)
        }).catch((e) => {
          console.log(e.response.text);
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
          callback(`It seems there are some permission issues`); return;
          console.log(err);
        }
      }
    }
  });

  cmds["stats"] = new Command(`Show Jolty's statistics off`, `stats`, 2, false, async (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let bot = msg.client;
    let ut = moment(startDate).startOf('minute').fromNow();
    db.User.find({}, (err, data) => {
      if(err) console.log(err);
      else{
        if(!data) msg.channel.send(`${msg.member.nickname || msg.author.username}: I have been running for \`${ut.slice(0, ut.indexOf(" ago"))}\`\nI am in \`${bot.guilds.size}\` servers with a total of \`0\` whitelisted people using me`);
        else msg.channel.send(`${msg.member.nickname || msg.author.username}: I have been running for \`${ut.slice(0, ut.indexOf(" ago"))}\`\nI am in \`${bot.guilds.size}\` servers with a total of \`${Object.keys(data).length}\` whitelisted people using me`);
      }
    })
  });

  return cmds;

}
