`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Check how many Jolty points you currently have`, `jp`, 1, true, async (msg, args, callback) => {
        if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let jp = await Scripts.getJP(msg.author.id);
        msg.channel.send(`${msg.member.nickname || msg.author.username}: You have ${jp} Jolty points`);
    });
    return cmd;
}