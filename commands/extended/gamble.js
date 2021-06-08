`use strict`;

const Config = require("../../config");
const Command = require("../Command");
const Scripts = require("../../scripts");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Gamble all your Jolty points away, or.. win big\nProbability: (20- = 50%) (50- = 48%) (100- = 45%) (200- = 40%) (500- = 35%) (1000- = 30%)`, `gamble (defaults to 20)\ngamble <integer amount greater than 5>`, 1, true, async (msg, args, callback) => {
        if(args.length > 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let amount = parseInt(args[1]);
        if(!amount) amount = 20;
        if(typeof amount !== 'number' || (amount % 1) !== 0){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let jp = await Scripts.getJP(msg.author.id);
        if(amount > jp){ callback(`You don't have enough Jolty points to gamble that amount`); return; }
        if(amount < 5){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let probability;
        if(amount <= 20) probability = .5;
        else if(amount <= 50) probability = .48;
        else if(amount <= 100) probability = .45;
        else if(amount <= 200) probability = .40;
        else if(amount <= 500) probability = .35;
        else if(amount <= 1000) probability = .30;
        else probability = .1;
        let chance = Math.random();
        if(chance < probability){
          Scripts.changeJP(msg.author.id, amount);
          msg.channel.send(`${msg.member.nickname || msg.author.username}: You gained ${amount} Jolty points!`);
          return;
        }else{
          Scripts.changeJP(msg.author.id, (-1 * amount));
          msg.channel.send(`${msg.member.nickname || msg.author.username}: You gambled away ${amount} Jolty points.. Better luck next time`);
          return;
        }
    });
    return cmd;
}