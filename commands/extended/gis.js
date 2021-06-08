`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");
const ImagesClient = require('google-images');

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let GIS = new ImagesClient(Config.gisEID, Config.gisAPI);
    let cmd = new Command(`Search Google Images with key words (10 JP)`, `gis <key words>`, 1, true, async (msg, args, callback) => {
        if(args.length < 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let jp = await Scripts.getJP(msg.author.id);
        if(jp < 10){ callback(`You don't have enough Jolty points`); return; }
        GIS.search(msg.content.slice(5))
          .then(function (images) {
              var i = 0;
              let urls = "";
              for(img in images) {
                urls += images[img].url + " ";
                i++;
                if(i == 3){
                  break;
                }
              }
              if(urls.length == 0){
                msg.channel.send(`${msg.member.nickname || msg.author.username}: Nothing was found using those key words. 10 JP has been refunded.`);
                return;
              }else{
                Scripts.changeJP(msg.author.id, -10);
                msg.channel.send(`${msg.member.nickname || msg.author.username}: I searched for \`${msg.content.slice(5)}\` and this is what I found: \n${urls}`);
              }
          });
    });
    return cmd;
}