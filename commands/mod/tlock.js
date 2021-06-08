`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Database = require("../../db/Database");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Lock/unlock the bot in this server`, `tlock`, 2, false, (msg, args, callback) => {
        if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let _settings = Database.get("settings");
        let _tlocked = _settings.tlocked;
        if(_tlocked.indexOf(msg.guild.id) === -1){
          _tlocked.push(msg.guild.id);
          msg.channel.send(`I have been locked by <@${msg.author.id}>`);
        }else{
          _tlocked.splice(_tlocked.indexOf(msg.guild.id), 1);
          msg.channel.send(`I have been unlocked by <@${msg.author.id}>`);
        }
        _settings.tlocked = _tlocked;
        Database.update("settings", _settings);
    });
    return cmd;
}