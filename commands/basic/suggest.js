`use strict`;

const Config = require("../../config");
const Command = require("../Command");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Send a suggestion to the bot developer`, `suggest <type your suggestion here>`, 1, false, async (msg, args, callback) => {
        if(args.length < 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let guild = msg.client.guilds.get(Config.devServer);
        if(!guild){ callback(`Something is wrong with the configuration file - Dev Server`); return; }
        let channel = guild.channels.get(Config.suggestionChannel);
        if(!channel){ callback(`Something is wrong with the configuration file - Suggestion Channel`); return; }
        channel.send(`${msg.author.username} (${msg.author.id}): ${msg.content.slice(msg.content.indexOf(args[1]))}`); // Send suggestion to suggestion channel in development server
        msg.channel.send(`${msg.member.nickname || msg.author.username}: Thanks for your suggestion! I forwarded it to the developer.`);
        return;
    });
    return cmd;
}