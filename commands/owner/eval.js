`use strict`;

const Config = require("../../config");
const Command = require("../Command");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let clean = text => {
        if(typeof(text) === "string"){
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        }else{
            return text;
        }
    }

    let cmd = new Command("Evaluate code", "eval <code>", 4, false, (msg, args, callback) => {
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

    return cmd;
}