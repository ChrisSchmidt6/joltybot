`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command("Get DB info quickly (not used to make DB changes)", "db <collection> <search>", 4, false, async (msg, args, callback) => {
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
    return cmd;
}