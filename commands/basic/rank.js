`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`See where you stand with the bot`, `rank`, 1, false, async (msg, args, callback) => {
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
    return cmd;
}