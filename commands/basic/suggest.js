`use strict`;

const Config = require('../../config');
const Command = require("../Command");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Send a suggestion to the bot developer`, // Description
    `\`suggest <type your suggestion here>\``, // Command examples
    1, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length < 2) {
        callback(getError(msg, args));
        return;
      }
      let guild = await msg.client.guilds.fetch(Config.devServer);
      if (!guild) {
        callback(`Something is wrong with the configuration file - Dev Server`);
        return;
      }
      let channel = await guild.channels.cache.get(Config.suggestionChannel);
      if (!channel) {
        callback(
          `Something is wrong with the configuration file - Suggestion Channel`
        );
        return;
      }
      // Send suggestion to suggestion channel in development server:
      channel.send(
        `${msg.author.username} (${
          msg.author.id
        }) has sent the following suggestion:\n\`${msg.content.slice(
          msg.content.indexOf(args[1])
        )}\``
      );
      msg.reply({
        content: `Thanks for your suggestion! I forwarded it to the developer.`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }
  );
  return cmd;
};
