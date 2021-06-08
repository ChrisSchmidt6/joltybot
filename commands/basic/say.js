`use strict`;

const Config = require("../../config");
const Command = require("../Command");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Command the bot to say something (Abusing this will get you blacklisted from Jolty)`, `say <word/sentence>`, 1, false, (msg, args, callback) => {
        if(args.length === 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let sayThis = msg.content.slice(msg.content.indexOf(" ") + 1);
        msg.channel.send(`${sayThis}`);
    });
    return cmd;
}