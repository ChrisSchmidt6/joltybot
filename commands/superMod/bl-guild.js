`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");
const db = require("../../db");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Blacklist/unblacklist a guild (You MUST provide a reason)`, `bl-guild (this will blacklist the guild you type this in)\nbl-guild <guild id>\nbl-guild <guild id> <reason>`, 3, false, (msg, args, callback) => {
        if(args.length > 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        msg.channel.send(`This command is a work in progress.`);
    });

    return cmd;
}