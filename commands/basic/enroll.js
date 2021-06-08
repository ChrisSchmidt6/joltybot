`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const db = require('../../db');
const Scripts = require("../../scripts");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Sign up for the extended Jolty program (allows access to Jolty points and numerous other commands)`, `enroll`, 1, false, async (msg, args, callback) => {
        if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let user = await Scripts.getUser(msg.author.id);
        if(user) { callback(`You are already enrolled in the extended Jolty program`); return; }
        new db.User({
            disID: msg.author.id
        }).save(err => {
            if(err) console.log(err);
            else{
            let cmds = require("./extended").getCommands({});
            let userCmds = ``;
            for (cmd in cmds) userCmds += `\`${cmd}\`, `;
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You have enrolled! You now have access to the following additional commands:\n${userCmds.slice(0,-2)}\nTo get help with any of them, use the command __\`${Config.prefix}help <cmd>\`__`);
            }
            return;
        });
    });
    return cmd;
}