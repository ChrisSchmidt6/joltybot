`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`See what level you have reached`, `lvl`, 1, true, async (msg, args, callback) => {
        if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let user = await Scripts.getUser(msg.author.id);
        let lvl = user.lvl;
        let xp = user.xp;
        let xpArray = require("../../scripts/activityScript").xpArray;
        let xpLeft = xpArray[lvl - 1] - xp;
        msg.channel.send(`${msg.member.nickname || msg.author.username}: You are level \`${lvl}\`, with \`${xp}\` total XP.\nYou need \`${xpLeft}\` more XP to level up`);
    });
    return cmd;
}