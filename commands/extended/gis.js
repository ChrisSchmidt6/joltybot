`use strict`;

const Config = require('../../config');
const Command = require("../Command");
const Scripts = require("../../scripts");
const ImagesClient = require("google-images");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let GIS = new ImagesClient(Config.gisEID, Config.gisAPI);
  let cmd = new Command(
    `Search Google Images with key words (10 JP)`, // Description
    `\`gis <key words>\``, // Command examples
    1, // Minimum rank
    true, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length < 2) {
        callback(getError(msg, args));
        return;
      }
      let jp = await Scripts.getJP(msg.author.id);
      if (jp < 10) {
        callback(`You don't have enough Jolty points`);
        return;
      }
      let query = msg.content.slice(msg.content.indexOf(' ') + 1);
      GIS.search(query).then(function (images) {
        var i = 0;
        let urls = "";
        for (img in images) {
          urls += images[img].url + " ";
          i++;
          if (i == 3) {
            break;
          }
        }
        if (urls.length == 0) {
          msg.reply({
            content: `Nothing was found using those key words. 10 JP has been refunded.`,
            allowedMentions: { repliedUser: false },
          });
          return;
        } else {
          Scripts.changeJP(msg.author.id, -10);
          msg.reply({
            content: `I searched for \`${query}\` and this is what I found: \n${urls}`,
            allowedMentions: { repliedUser: false },
          });
        }
      });
    }
  );
  return cmd;
};
