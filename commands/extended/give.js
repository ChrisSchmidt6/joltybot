`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Share your Jolty points with others`, `give <@user> <natural number 10 or higher>`, 1, true, async (msg, args, callback) => {
        if(args.length !== 3){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        if(args[1].slice(0, 2) !== "<@" && args[1].slice(-1) !== ">"){ callback(`You must specify someone using "@user"`); return; }
        if(parseInt(args[2]) != args[2] || args[2] < 10){ callback(`You must specify a natural number; 10 or higher (no fractions)`); return; }
        // Just double checking mhmhmhm
        args[2] = parseInt(args[2]);
        // Seeing as @mentions are displayed as <@number> we gotta pull some tricks to get the ID.
        args[1] = args[1].slice(2, -1);
        // Sometimes IDs have a ! in front for no reason, so we gotta check for that too and get rid of it.
        if(args[1].slice(0, 1) === "!") args[1] = args[1].slice(1);
        if(!msg.guild.member(args[1])){ callback(`The person you specified either doesn't exist, or is not in this server`); return; }
        if(args[1] === msg.author.id){ callback(`Try giving it to someone who isn't you`); return; }
        let target = await Scripts.getUser(args[1]);
        if(!target){ callback(`The person you specified is not enrolled in the extended Jolty program`); return; }
        let jp = await Scripts.getJP(msg.author.id);
        if(jp < args[2]){ callback(`You don't have enough Jolty points to give away that amount`); return; }
        Scripts.changeJP(msg.author.id, (-1 * args[2]));
        Scripts.changeJP(args[1], args[2]);
        msg.channel.send(`${msg.member.nickname || msg.author.username}: You gave ${args[2]} Jolty points to <@${args[1]}>. How generous!`);
        return;
    });
    return cmd;
}