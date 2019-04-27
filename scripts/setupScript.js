`use strict`;

const Database = require("../db/Database");
const db = require('../db');
const Scripts = require("./");
const Config = require("../config");

const Basic = require("../commands/basics");
const Extended = require("../commands/extendedCmds");
const Moderator = require("../commands/modCmds");
const SuperMod = require("../commands/superModCmds");
const Owner = require("../commands/ownerCmds");

// ######################## Defining all the commands + ########################

let cmds = {};
cmds = Basic.getCommands(cmds);
cmds = Extended.getCommands(cmds);
cmds = Moderator.getCommands(cmds);
cmds = SuperMod.getCommands(cmds);
cmds = Owner.getCommands(cmds);

// ######################## - Defining all the commands ########################

module.exports.try = async msg => {

  if(msg.author.bot) return;
  
  if(msg.content.slice(0, Config.prefix.length).toLowerCase() !== Config.prefix) return true;

  let rank = await Scripts.getRank(msg.author.id);

  //if(Database.get("settings").blacklist.guilds.indexOf(msg.guild.id) > -1 && rank < 3) return;

  let blacklisted = await Scripts.getBlacklist("user", msg.author.id);
  if(blacklisted) return;

  if(msg.member.hasPermission("KICK_MEMBERS")){
    if(rank === 1) rank = 2;
  }
  
  if(rank < 3 && Database.get("settings")["locked"]) return;

  let args = msg.content.split(" ");

  let cmd = args[0].slice(Config.prefix.length);

  if(rank < 3) if(Database.get("settings").tlocked.indexOf(msg.guild.id) > -1) return;
  
  if(rank < 1) return;

  if(cmds[cmd]){
    db.User.findOne({disID: msg.author.id}, {_id: 1}, (err, data) => {
      if(err){ console.log(err); return; }
      else{
        if(cmds[cmd].canUse(rank) && data){
          cmds[cmd].execute(msg, args, err => {
            msg.channel.send(`${msg.member.nickname || msg.author.username}: \`ERROR\`\n${err}`);
            return true;
          });
        }else{
          if(!cmds[cmd].canUse(rank)){
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You do not have a high enough rank to use this command`);
            return;
          }else if(cmds[cmd].extProgram){
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You are not enrolled in the extended Jolty program. To enroll, type \`${Config.prefix}enroll\` It's free, why not?`);
            return;
          }
          cmds[cmd].execute(msg, args, err => {
            msg.channel.send(`${msg.member.nickname || msg.author.username}: \`ERROR\`\n${err}`);
            return;
          });
        }
      }
    });
  }

}
