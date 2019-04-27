`use strict`;

const Discord = require('discord.js');
const Command = require("./Command");
const db = require('../db');
const Scripts = require("../scripts");
const Config = require("../config");
const getRandomID = require("../scripts/getRandomID");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.getCommands = cmds => {

  cmds["help"] = new Command(`Get general help for the bot or get information about a command`, `help\nhelp <command>`, 1, false, async (msg, args, callback) => {
    if(args.length > 1){
      if(args.length > 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
      if(!cmds[args[1].toLowerCase()]){ callback(getError(args[0].slice(Config.prefix.length))); return; }
      msg.channel.send(`${msg.member.nickname || msg.author.username}: The description of \`${args[1].toLowerCase()}\` is \`${cmds[args[1].toLowerCase()].description}\`.\nHow you should use the command:\n\`${cmds[args[1].toLowerCase()].usage}\``);
      return;
    }
    let userCmds = ``;
    let rank = await Scripts.getRank(msg.author.id);
    let user = await Scripts.getUser(msg.author.id);
    if(rank < 2 && msg.member.hasPermission("KICK_MEMBERS")) rank = 2;
    for (cmd in cmds) {
      if(rank >= cmds[cmd].minRank && !cmds[cmd].extProgram) userCmds += `\`${cmd}\`, `;
      if(rank >= cmds[cmd].minRank && cmds[cmd].extProgram && user){
        userCmds += `\`${cmd}\`, `;
      }
    }
    if(user) userCmds = userCmds.replace("\`enroll\`, ", "");
    msg.channel.send(`${msg.member.nickname || msg.author.username}: Contact a bot staff member for urgent help. Otherwise, to get help with a command use \`${Config.prefix}help <command>\`\n${user ? '' : `If you want to enroll in the extended Jolty program, type \`${Config.prefix}enroll\`\n`}You have access to the following commands:\n${userCmds.slice(0,-2)}`);
    return;
  });

  cmds["rank"] = new Command(`See where you stand with the bot`, `rank`, 1, false, async (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let rank = await Scripts.getRank(msg.author.id);
    if(rank < 2) if(msg.member.hasPermission("KICK_MEMBERS")) rank = 2;
    let rankDesc = '';
    switch(rank){
      case 1:
        rankDesc = "Regular User";
        break;
      case 2:
        rankDesc = "Moderator";
        break;
      case 3:
        rankDesc = "Super Moderator";
        break;
      case 4:
        rankDesc = "Admin"
        break;
      default:
        rankDesc = "unknown"
        break;
    }
    msg.channel.send(`${msg.member.nickname || msg.author.username}: Your rank is: \`${rankDesc}\``);
  });

  cmds["id"] = new Command(`Get your Discord ID`, `id`, 1, false, (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    msg.channel.send(`${msg.member.nickname || msg.author.username}: Your Discord ID is \`${msg.author.id}\``);
  });

  cmds["say"] = new Command(`Command the bot to say something (Abusing this will get you blacklisted from Jolty)`, `say <word/sentence>`, 1, false, (msg, args, callback) => {
    if(args.length === 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let sayThis = msg.content.slice(msg.content.indexOf(" ") + 1);
    msg.channel.send(`${sayThis}`);
  });

  cmds["poll"] = new Command(`Get people to vote on things`, `poll create <question:option:option:option> (you can add as many options up to 5, 10 if you're enrolled in the Jolty extended program)\npoll view <poll ID>\npoll vote <poll ID> <option #>\npoll end <poll ID>`, 1, false, async (msg, args, callback) => {
    if(args.length < 3){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    if(args[1] !== "create" && args[1] !== "view" && args[1] !== "vote" && args[1] !== "end"){ callback(`You must specify "create", "view", "vote", or "end"`); return; }
    let user = await Scripts.getUser(msg.author.id);
    if(!user) user = { enrolled: false };

    let endPoll = async pID => {
      let temp = await Scripts.getTempPoll(pID);
      embed = temp.embed;
      let winningOption = [[0, 0]];
      embed.fields = [{}];
      for(var i = 0; i < temp.options.length; i++){
        embed.fields.push({name: `${temp.options[i].votes} votes:`, value: temp.options[i].option, inline: true});
        temp.options[i].optNum = (i + 1);
        if(i === 0) winningOption = [temp.options[i]]
        else
          if(temp.options[i].votes === winningOption[0].votes) winningOption.push(temp.options[i]);
          if(temp.options[i].votes > winningOption[0].votes) winningOption = [temp.options[i]];
      }
      if(winningOption.length === 1){
        embed.fields[0] = {name: `**THE WINNER**`, value: `Option ${winningOption[0].optNum}: "${winningOption[0].option}" won with ${winningOption[0].votes} votes!`, inline: false};
        embed.fields[winningOption[0].optNum].name = "__" + embed.fields[winningOption[0].optNum].name + "__";
      }else{
        for(var i = 0; i < winningOption.length; i++){
          embed.fields[winningOption[i].optNum].name = "__" + embed.fields[winningOption[i].optNum].name + "__";
        }
        embed.fields[0] = {name: `**THE WINNER**`, value: `There is a ${winningOption.length} way tie at ${winningOption[0].votes} votes!`, inline: false}
      }
      delete embed.description;
      msg.channel.send(`Poll ${pID} has expired and been deleted. Here are the results:`);
      msg.channel.send({embed: embed});
      msg.author.send(`Hey! Your poll has expired and been deleted. Here are the results:`);
      msg.author.send({embed: embed});
      db.TempPoll.deleteOne({_id: pID}, (err) => {
        if(err) console.log(err);
      });
    }

    if(args[1] === "vote"){
      if(args.length !== 4){ callback(getError(args[0].slice(Config.prefix.length))); return; }
      let pID = args[2];
      let optionVote = args[3];
      optionVote = parseInt(optionVote);
      if(typeof optionVote !== 'number' || (optionVote % 1) !== 0 || optionVote <= 0){ callback(`You must enter a valid option #`); return; }
      let temp = await Scripts.getTempPoll(pID);
      if(!temp){ callback(`There is no poll with that ID`); return; }
      if(temp.voters.indexOf(msg.author.id) > -1){ callback(`You have already voted on this poll`); return; }
      if(temp.options.length < optionVote){ callback(`That poll doesn't have that option`); return; }
      temp.voters.push(msg.author.id);
      temp.options[optionVote - 1].votes++;
      temp.markModified('options');
      temp.save(err => {
        if(err){ console.log(err); return; }
      });
      msg.channel.send(`${msg.member.nickname || msg.author.username}: You voted for Option ${optionVote}: "${temp.options[optionVote - 1].option}" on poll ${pID}`);
      return;
    }else if(args[1] === "view"){
      let pID = args[2];
      let temp = await Scripts.getTempPoll(pID);
      if(!temp){ callback(`There is no poll with that ID`); return; }
      msg.channel.send({embed: temp.embed});
      return;
    }else if(args[1] === "end"){
      let pID = args[2];
      let temp = await Scripts.getTempPoll(pID);
      if(!temp){ callback(`There is no poll with that ID`); return; }
      if(!temp.authorID === msg.author.id){ callback(`You did not start Poll ${pID}`); return; }
      clearTimeout(temp.timer);
      endPoll(pID);
      return;
    }else{
      let options = msg.content.slice(14).split(":");
      if(options.length < 3){ callback(`You must have at least 2 options for people to vote on`); return; }
      if(!user.enrolled && options.length > 5){ callback(`You are only allowed to set 4 voting options`); return; }
      if(options.length > 9){ callback(`You are only allowed to set 8 voting options`); return; }
      let pID = "P" + getRandomID.fetch(5);
      let temp = new db.TempPoll({
        _id: pID,
        question: options[0],
        authorID: msg.author.id,
        options: [],
        voters: []
      });
      for(var i = 1; i < options.length; i++){
        temp.options.push({option: options[i], votes: 0});
      }
      let embed = new Discord.RichEmbed({
        author: {
          name: msg.author.username + "#" + msg.author.discriminator,
          icon_url: msg.author.avatarURL
        },
        color: 0xFF00FF,
        title: `Poll ${pID}: **__${temp.question}__**`,
        description: `Vote by typing ${Config.prefix}poll vote ${pID} <option #>`,
        fields: [],
        thumbnail: {
          url: "https://cdn.pixabay.com/photo/2016/10/18/18/19/question-mark-1750942_960_720.png",
          height:50,
          width: 50
        },
        timestamp: new Date()
      });
      for(var i = 0; i < temp.options.length; i++){
        embed.fields.push({name: "Option " + (i + 1), value: temp.options[i].option, inline: true});
      }
      temp.embed = embed;
      temp.save(err => {
        if(err){ console.log(err); return; }
      });
      let expireMins = 15;
      if(user.enrolled) expireMins = 60;
      setTimeout(async function(pID){
        let temp = await Scripts.getTempPoll(pID);
        if(!temp) return;
        endPoll(pID);
      }, expireMins * 60 * 1000);
      msg.channel.send(`${msg.member.nickname || msg.author.username}: Your poll will expire in ${expireMins} minutes`);
      msg.channel.send({embed: embed});
      return;
    }
  });

  cmds["dice"] = new Command(`Roll between 1 and 5 dice with up to 20 sides`, `dice (defaults to a single 6 sided die)\ndice <# of sides between 2 and 20>\ndice <# of dice between 1 and 5> <# of sides between 2 and 20>\ndice <# of dice between 1 and 5> <# of sides between 2 and 20> +<bonus between 1 and 20>`, 1, false, (msg, args, callback) => {
    if(args.length > 4){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let dice;
    if(args.length <= 2){
      if(args.length === 1){
        dice = 6;
      }else if(args.length === 2){
        dice = args[1];
        if(parseInt(dice) != dice){
          callback(`You must specify a natural number (2, 3, 4, ...)`); return;
        }else{
          if(parseInt(dice) < 2 || parseInt(dice) > 20){
            callback(`You must specify a natural number between 2 and 20`); return;
          }
        }
      }
      let newDice = Math.ceil(Math.random() * dice);
      msg.channel.send(`${msg.member.nickname || msg.author.username}: You rolled a ${newDice} with a ${dice} sided die!`); return;
    }else{
      let numDice, bonus = 0;
      if(args.length >= 3){
        numDice = args[1];
        dice = args[2];
        if(parseInt(numDice) != numDice){
          callback(`Error with # of dice: You must specify a natural number (1, 2, 3, ...)`); return;
        }else{
          if(parseInt(numDice) < 1 || parseInt(numDice) > 5){
            callback(`Error with # of dice: You must specify a natural number between 1 and 5`); return;
          }
        }
        if(parseInt(dice) != dice){
          callback(`Error with # of sides: You must specify a natural number (2, 3, 4, ...)`); return;
        }else{
          if(parseInt(dice) < 2 || parseInt(dice) > 20){
            callback(`Error with # of sides: You must specify a natural number between 2 and 20`); return;
          }
        }
        if(args.length === 4){
          if(args[3].slice(0, 1) !== "+"){
            callback(`Error with bonus/advantage: Make sure to include + in front of the bonus (+1, +2, +3, ...)`); return;
          }else{
            bonus = args[3].slice(1);
            if(parseInt(bonus) != bonus){
              callback(`Error with bonus/advantage: You must specify a natural number (1, 2, 3, ...)`); return;
            }else{
              if(parseInt(bonus) < 1 || parseInt(bonus) > 20){
                callback(`Error with bonus/advantage: You must specify a natural number between 1 and 20`); return;
              }
            }
            bonus = parseInt(bonus);
          }
        }
        let newDice = "", totalDice = bonus;
        for(var i = 0; i < numDice; i++){
          let tempNum = Math.ceil(Math.random() * dice);
          totalDice += tempNum;
          if(i === numDice - 1) newDice += tempNum;
          else newDice += tempNum + ", ";
        }
        msg.channel.send(`${msg.member.nickname || msg.author.username}: You rolled ${(numDice > 1) ? `${numDice} dice`:`a die`} with ${dice} sides${(bonus > 0) ? ` and a +${bonus} bonus`: ''} and got ${totalDice}!${(numDice > 1) ? `\nIndividual rolls are ${newDice}`: ''}`); return;
      }
    }
  });

  cmds["enroll"] = new Command(`Sign up for the extended Jolty program (allows access to Jolty points and numerous other commands)`, `enroll`, 1, false, async (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let user = await Scripts.getUser(msg.author.id);
    if(user) { callback(`You are already enrolled in the extended Jolty program`); return; }
    new db.User({
      disID: msg.author.id
    }).save(err => {
      if(err) console.log(err);
      else{
        let cmds = require("./extendedCmds").getCommands({});
        let userCmds = ``;
        for (cmd in cmds) userCmds += `\`${cmd}\`, `;
        msg.channel.send(`${msg.member.nickname || msg.author.username}: You have enrolled! You now have access to the following additional commands:\n${userCmds.slice(0,-2)}\nTo get help with any of them, use the command __\`${Config.prefix}help <cmd>\`__`);
      }
      return;
    });
  });

  return cmds;

}
