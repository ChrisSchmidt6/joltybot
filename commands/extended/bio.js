`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");
const db = require('../../db');

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Let people know about yourself or use it for something like friend codes and gamertags`, `bio set <bio goes here>\nbio view <@user>`, 1, true, async (msg, args, callback) => {
        if(args.length <= 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let method = args[1].toLowerCase();
        switch(method){
          case "set":
            let bio = msg.content.slice(msg.content.indexOf(args[2]));
            db.User.updateOne({disID: msg.author.id}, {$set: {bio: bio}}, (err) => {
              if(err) msg.channel.send(`\`\`\`js${err}\`\`\``);
              else{
                msg.channel.send(`${msg.member.nickname || msg.author.username}: You have set your bio to:\n\`${bio}\``);
              }
            });
            break;
          case "view":
            let user = args[2];
            if(user.slice(0, 2) !== "<@" && user.slice(-1) !== ">"){ callback(`You must specify someone using "@user"`); return; }
            // Seeing as @mentions are displayed as <@number> we gotta pull some tricks to get the ID.
            user = user.slice(2, -1);
            // Sometimes IDs have a ! in front for no reason, so we gotta check for that too and get rid of it.
            if(user.slice(0, 1) === "!") user = user.slice(1);
            // Check bot's DB for user's Discord ID, if it doesn't exist it will return false
            userInfo = await Scripts.getUser(user);
            if(!msg.guild.member(user)){ callback(`The person you specified either doesn't exist, or is not in this server`); return; }
            if(!userInfo){ callback(`The person you specified is not whitelisted`); return; }
            if(userInfo.bio.length === 0){ callback(`The person you specified has no bio set`); return; }
            msg.channel.send(`${msg.member.nickname || msg.author.username}: Here is <@${user}>'s bio as requested:\n\`${userInfo.bio}\``);
            break;
          default:
            callback(getError(args[0].slice(Config.prefix.length))); return;
        }
        return;
    });
    return cmd;
}