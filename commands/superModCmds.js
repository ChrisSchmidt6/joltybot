`use strict`;

const Command = require("./Command");
const Database = require("../db/Database");
const db = require("../db");
const Scripts = require("../scripts");
const Config = require("../config");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.getCommands = cmds => {

  cmds["glock"] = new Command(`Lock/unlock the bot globally`, `glock`, 3, false, (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let _settings = Database.get("settings");
    if(!_settings["locked"]){
      _settings["locked"] = true;
      msg.channel.send(`I have been globally locked by <@${msg.author.id}>`);
    }else{
      _settings["locked"] = false;
      msg.channel.send(`I have been globally unlocked by <@${msg.author.id}>`);
    }
    Database.update("settings", _settings);
  });

  cmds["bl-user"] = new Command(`Blacklist/unblacklist a user (You MUST provide a reason)`, `bl-user <@user>\nbl-user <@user> <reason>`, 3, false, async (msg, args, callback) => {
    if(args.length < 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    if(args[1].slice(0, 2) !== "<@" && args[1].slice(-1) !== ">"){ callback(`You must specify someone using "@user"`); return; }
    args[1] = args[1].slice(2, -1);
    if(args[1].slice(0, 1) === "!") args[1] = args[1].slice(1);
    if(args[1].length !== 18){ callback(`You must specify someone using "@user"`); return; }
    for(var i = 0; i < args[1].length; i++){
      var isNumber = false;
      for(var z = 0; z < numbers.length; z++){
        if(args[1].slice(i, i + 1).indexOf(numbers[z]) > -1) isNumber = true;
      }
      if(!isNumber){ callback(`You did not @ a real user`); return; }
    }
    if(!msg.guild.member(args[1])){ callback(`The person you specified either doesn't exist, or is not in this server`); return; }
    if(args[1] === msg.author.id){ callback(`Luckily for you, you can't blacklist yourself`); return; }
    let user = await Scripts.getUser(args[1]);
    let self = await Scripts.getUser(msg.author.id);
    let blacklist = await Scripts.getBlacklist('user', user.disID);
    if(user) if(self.grank <= user.grank){ callback(`You aren't a high enough rank to blacklist this person`); return; }
    if(!blacklist){
      if(args.length < 3){ callback(`You must include a reason when blacklisting someone!`); return; }
      let BlUser = new db.Blacklist({
        _id: user.disID,
        type: 'user',
        reason: msg.content.slice(msg.content.indexOf(args[2])),
        completedBy: [msg.author.username + "#" + msg.author.discriminator, msg.author.id]
      });
      BlUser.save(err => {
        if(err) console.log(err);
        else msg.channel.send(`<@${msg.author.id}>: I have blacklisted <@${user.disID}>`);
      });
    }else{
      db.Blacklist.deleteOne({_id: user.disID}, (err) => {
        if(err) console.log(err);
      });
      msg.channel.send(`<@${msg.author.id}>: I have unblacklisted <@${user.disID}>`);
    }
  });

  /*cmds["bl-guild"] = new Command(`Blacklist/unblacklist a guild (You MUST provide a reason)`, `bl-guild (this will blacklist the guild you type this in)\nbl-guild <guild id>\nbl-guild <guild id> <reason>`, 3, false, (msg, args, callback) => {
    if(args.length > 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let _settings = Database.get("settings");
    let _blacklist = _settings.blacklist.guilds;
    let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let guild = msg.guild.id;
    if(args.length === 2){
      if(args[1].length !== 18){ callback(`You must enter a valid guild ID`); return; }
      for(var i = 0; i < args[1].length; i++){
        var isNumber = false;
        for(var z = 0; z < numbers.length; z++){
          if(args[1].slice(i, i + 1).indexOf(numbers[z]) > -1) isNumber = true;
        }
        if(!isNumber){ callback(`You must enter a valid guild ID`); return; }
      }
      guild = args[1];
    }
    if(_blacklist.indexOf(guild) === -1){
      _blacklist.push(guild);
      msg.channel.send(`<@${msg.author.id}>: I have blacklisted guild ${guild}`);
    }else{
      _blacklist.splice(_blacklist.indexOf(guild), 1);
      msg.channel.send(`<@${msg.author.id}>: I have unblacklisted guild ${guild}`);
    }
    _settings.blacklist.guilds = _blacklist;
    Database.update("settings", _settings);
  });*/

  return cmds;

}
