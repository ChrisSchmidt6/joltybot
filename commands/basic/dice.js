`use strict`;

const Config = require("../../config");
const Command = require("../Command");

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.create = () => {
    let cmd = new Command(`Roll between 1 and 5 dice with up to 20 sides`, `dice (defaults to a single 6 sided die)\ndice <# of sides between 2 and 20>\ndice <# of dice between 1 and 5> <# of sides between 2 and 20>\ndice <# of dice between 1 and 5> <# of sides between 2 and 20> +<bonus between 1 and 20>`, 1, false, (msg, args, callback) => {
        if(args.length > 4){ callback(getError(args[0].slice(Config.prefix.length))); return; }
        let dice;
        if(args.length <= 2){
            if(args.length === 1){
            dice = 6;
            }else if(args.length === 2){
            dice = args[1];
            if(parseInt(dice) != dice){
                callback(`You must specify a natural number (2, 3, 4, ...)`); return;
            }else{
                if(parseInt(dice) < 2 || parseInt(dice) > 20){
                callback(`You must specify a natural number between 2 and 20`); return;
                }
            }
            }
            let newDice = Math.ceil(Math.random() * dice);
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You rolled a ${newDice} with a ${dice} sided die!`); return;
        }else{
            let numDice, bonus = 0;
            if(args.length >= 3){
            numDice = args[1];
            dice = args[2];
            if(parseInt(numDice) != numDice){
                callback(`Error with # of dice: You must specify a natural number (1, 2, 3, ...)`); return;
            }else{
                if(parseInt(numDice) < 1 || parseInt(numDice) > 5){
                callback(`Error with # of dice: You must specify a natural number between 1 and 5`); return;
                }
            }
            if(parseInt(dice) != dice){
                callback(`Error with # of sides: You must specify a natural number (2, 3, 4, ...)`); return;
            }else{
                if(parseInt(dice) < 2 || parseInt(dice) > 20){
                callback(`Error with # of sides: You must specify a natural number between 2 and 20`); return;
                }
            }
            if(args.length === 4){
                if(args[3].slice(0, 1) !== "+"){
                callback(`Error with bonus/advantage: Make sure to include + in front of the bonus (+1, +2, +3, ...)`); return;
                }else{
                bonus = args[3].slice(1);
                if(parseInt(bonus) != bonus){
                    callback(`Error with bonus/advantage: You must specify a natural number (1, 2, 3, ...)`); return;
                }else{
                    if(parseInt(bonus) < 1 || parseInt(bonus) > 20){
                    callback(`Error with bonus/advantage: You must specify a natural number between 1 and 20`); return;
                    }
                }
                bonus = parseInt(bonus);
                }
            }
            let newDice = "", totalDice = bonus;
            for(var i = 0; i < numDice; i++){
                let tempNum = Math.ceil(Math.random() * dice);
                totalDice += tempNum;
                if(i === numDice - 1) newDice += tempNum;
                else newDice += tempNum + ", ";
            }
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You rolled ${(numDice > 1) ? `${numDice} dice`:`a die`} with ${dice} sides${(bonus > 0) ? ` and a +${bonus} bonus`: ''} and got ${totalDice}!${(numDice > 1) ? `\nIndividual rolls are ${newDice}`: ''}`); return;
            }
        }
    });
    return cmd;
}