`use strict`;

const Discord = require("discord.js");
const Command = require("../Command");
const Scripts = require("../../scripts");
const getRandomID = require("../../scripts/getRandomID");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    `Get people to vote on things`, // Description
    // Command examples >>
    `\`poll <question:option:option:option>\` (you can add as many options up to 4, or 8 if you're enrolled in the Jolty extended program)`,
    1, // Minimum rank
    false, // 'Extended Jolty Program' command
    false, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length < 2) {
        callback(getError(msg, args));
        return;
      }
      const user = !!(await Scripts.getUser(msg.author.id));

      let options = msg.content.slice(7).split(":");
      if (options.length < 3) {
        callback(`You must have at least 2 options for people to vote on`);
        return;
      }
      if (!user && options.length > 5) {
        callback(`You are only allowed to set 4 voting options`);
        return;
      }
      if (options.length > 9) {
        callback(`You are only allowed to set 8 voting options`);
        return;
      }
      const pID = "P" + getRandomID.fetch(5);
      const reaction_numbers = [
        "1️⃣",
        "2️⃣",
        "3️⃣",
        "4️⃣",
        "5️⃣",
        "6️⃣",
        "7️⃣",
        "8️⃣",
        "❌",
      ];
      const question = options[0];
      options = options.slice(1); // Remove question from options
      let embed = new Discord.MessageEmbed({
        author: {
          name: `${msg.author.tag}   has created poll ${pID}:`,
          icon_url: msg.author.displayAvatarURL(),
        },
        color: 0xff00ff,
        title: `**__${question}__**`,
        description: `Vote by reacting with the corresponding number`,
        fields: [],
        thumbnail: {
          url: "https://cdn.pixabay.com/photo/2016/10/18/18/19/question-mark-1750942_960_720.png",
          height: 50,
          width: 50,
        },
        timestamp: new Date(),
      });

      let expireMins = 15;
      if (user) expireMins = 60;

      for (let i = 0; i < options.length; i++) {
        embed.fields.push({
          name: `Option ${reaction_numbers[i]}`,
          value: options[i],
          inline: true,
        });
      }

      embed.fields.push({
        name: `-`,
        value: `Poll creator can end the poll early by reacting with ❌\nOtherwise, the poll will end in ${expireMins} minutes`,
        inline: false,
      });

      msg.channel
        .send({
          content: `Your poll will expire in ${expireMins} minutes`,
          embeds: [embed],
        })
        .then((pollMessage) => {
          for (var i = 0; i < options.length; i++) {
            pollMessage.react(reaction_numbers[i]);
          }
          pollMessage.react("❌");
          const filter = (reaction, user) =>
            (user.id === pollMessage.author.id || !user.bot) &&
            reaction_numbers.indexOf(reaction.emoji.name) > -1;
          const votesCollector = pollMessage.createReactionCollector({
            filter,
            time: expireMins * 60 * 1000,
          });
          votesCollector.on("collect", (reaction, user) => {
            if (reaction.emoji.name === "❌" && user.id === msg.author.id) {
              votesCollector.stop();
            }
          });
          votesCollector.on("end", (collected, reason) => {
            embed.description = `Results are in!`;
            embed.timestamp = new Date();
            embed.color = 0x00ff00;
            delete embed.thumbnail;

            embed.fields = collected
              .filter((reaction) => reaction.emoji.name !== "❌")
              .map((reaction) => {
                let optionTitle = reaction.emoji.name;
                // Subtracting one from count because of bot's reactions :
                let count = reaction.count - 1;
                let option = options[reaction_numbers.indexOf(optionTitle)];
                return {
                  name: `${count} votes for:`,
                  value: `${optionTitle} - ${option}`,
                  inline: true,
                };
              });

            let reasonText = "The poll has ended for an unknown reason";
            if (reason === "user") {
              reasonText = "Poll creator has ended the poll";
            } else if (reason === "time") reasonText = "Poll time has expired";
            msg.channel.send({
              content: `${reasonText}, here are the results:`,
              embeds: [embed],
            });
          });
        })
        .catch(console.error);
      return;
    }
  );
  return cmd;
};
