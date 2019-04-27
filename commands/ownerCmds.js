`use strict`;

const Command = require("./Command");
const Database = require("../db/Database");
const Scripts = require("../scripts");
const Config = require("../config");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

let clean = text => {
  if(typeof(text) === "string"){
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  }else{
    return text;
  }
}

module.exports.getCommands = cmds => {

  cmds["sui"] = new Command("Put the bot to sleep, forever (get it? suicide. hahahaha..?)", "sui", 4, false, (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    msg.channel.send("Good night, everyone.");
    msg.client.destroy();
  });

  cmds["db"] = new Command("Get DB info quickly (not used to make DB changes)", "db <collection> <search>", 4, false, async (msg, args, callback) => {
    if(args.length < 3 || args.length > 3){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    try{
      let collection = args[1].toLowerCase();
      let search = args[2];
      let returnInfo = '';
      switch(collection){
        case 'user':
          returnInfo = await Scripts.getUser(search);
          break;
        case 'defs':
          returnInfo = await Scripts.getDefs(search);
          break;
        case 'polls':
          returnInfo = await Scripts.getPolls(search);
          break;
        default:
          callback('Unable to find that collection in the DB');
          return;
      }
      msg.channel.send(`\`\`\`js\n${returnInfo}\n\`\`\``);
      return;
    }catch(err){
      msg.channel.send(`\`CODE ERROR\` \n\`${clean(err)}\``);
      return;
    }
  });

  cmds["eval"] = new Command("Evaluate code", "eval <code>", 4, false, (msg, args, callback) => {
    if(args.length < 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    try{
      let evaled = eval(msg.content.slice(msg.content.indexOf(" ") + 1));
      if(typeof evaled !== "string") evaled = require("util").inspect(evaled);
      msg.channel.send(`\`\`\`js\n${clean(evaled)}\n\`\`\``);
      return;
    }catch(err){
      msg.channel.send(`\`CODE ERROR\` \n\`${clean(err)}\``);
      return;
    }
  });

  return cmds;

}
