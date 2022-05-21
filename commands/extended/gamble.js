`use strict`;

const Command = require("../Command");
const Scripts = require("../../scripts");

const getError = require("../improperUsageError");

module.exports.create = () => {
  let cmd = new Command(
    // Description >>
    `Gamble all your Jolty points away, or.. win big\nProbability: (20- = 50%) (50- = 48%) (100- = 45%) (200- = 40%) (500- = 35%) (1000- = 30%)`,
    // Command examples >>
    `\`gamble\` (defaults to 20)\n\`gamble <integer amount greater than 5>\``,
    1, // Minimum rank
    true, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length > 2) {
        callback(getError(msg, args));
        return;
      }
      let amount = parseInt(args[1]);
      if (!amount) amount = 20;
      if (typeof amount !== "number" || amount % 1 !== 0) {
        callback(getError(msg, args));
        return;
      }
      let jp = await Scripts.getJP(msg.author.id);
      if (amount > jp) {
        callback(`You don't have enough Jolty points to gamble that amount`);
        return;
      }
      if (amount < 5) {
        callback(getError(msg, args));
        return;
      }
      let probability;
      if (amount <= 20) probability = 0.5;
      else if (amount <= 50) probability = 0.48;
      else if (amount <= 100) probability = 0.45;
      else if (amount <= 200) probability = 0.4;
      else if (amount <= 500) probability = 0.35;
      else if (amount <= 1000) probability = 0.3;
      else probability = 0.1;
      let chance = Math.random();
      if (chance < probability) {
        Scripts.changeJP(msg.author.id, amount);
        msg.reply({
          content: `You gained ${amount} Jolty points!`,
          allowedMentions: { repliedUser: false },
        });
        return;
      } else {
        Scripts.changeJP(msg.author.id, -1 * amount);
        msg.reply({
          content: `You gambled away ${amount} Jolty points.. Better luck next time`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }
    }
  );
  return cmd;
};
