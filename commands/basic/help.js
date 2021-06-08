`use strict`;

const Config = require("../../config");
const Scripts = require("../../scripts");
const Command = require("../Command");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = (cmds) => {
    let cmd = new Command(`Get general help for the bot or get information about a command`, `help\nhelp <command>`, 1, false, async (msg, args, callback) => {
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
    return cmd;
}