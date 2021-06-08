`use strict`;

const Config = require("../../config");
const Command = require("../Command");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Get your Discord ID`, `id`, 1, false, (msg, args, callback) => {
        if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        msg.channel.send(`${msg.member.nickname || msg.author.username}: Your Discord ID is \`${msg.author.id}\``);
    });
    return cmd;
}