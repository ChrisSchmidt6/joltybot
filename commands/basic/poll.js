`use strict`;

const Discord = require('discord.js');
const Config = require("../../config");
const Command = require("../Command");
const db = require('../../db');
const Scripts = require("../../scripts");
const getRandomID = require("../../scripts/getRandomID");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Get people to vote on things`, `poll create <question:option:option:option> (you can add as many options up to 5, 10 if you're enrolled in the Jolty extended program)\npoll view <poll ID>\npoll vote <poll ID> <option #>\npoll end <poll ID>`, 1, false, async (msg, args, callback) => {
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
    return cmd;
}