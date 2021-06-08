`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Database = require("../../db/Database");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Lock/unlock the bot globally`, `glock`, 3, false, (msg, args, callback) => {
        if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let _settings = Database.get("settings");
        if(!_settings["locked"]){
          _settings["locked"] = true;
          msg.channel.send(`I have been globally locked by <@${msg.author.id}>`);
        }else{
          _settings["locked"] = false;
          msg.channel.send(`I have been globally unlocked by <@${msg.author.id}>`);
        }
        Database.update("settings", _settings);
    });
    return cmd;
}