`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const db = require("../../db");
const moment = require("moment");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let startDate = new Date();
    let cmd = new Command(`Show Jolty's statistics off`, `stats`, 2, false, async (msg, args, callback) => {
        if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let bot = msg.client;
        let ut = moment(startDate).startOf('minute').fromNow();
        db.User.find({}, (err, data) => {
          if(err) console.log(err);
          else{
            if(!data) msg.channel.send(`${msg.member.nickname || msg.author.username}: I have been running for \`${ut.slice(0, ut.indexOf(" ago"))}\`\nI am in \`${bot.guilds.size}\` servers with a total of \`0\` whitelisted people using me`);
            else msg.channel.send(`${msg.member.nickname || msg.author.username}: I have been running for \`${ut.slice(0, ut.indexOf(" ago"))}\`\nI am in \`${bot.guilds.size}\` servers with a total of \`${Object.keys(data).length}\` whitelisted people using me`);
          }
        });
    });
    return cmd;
}