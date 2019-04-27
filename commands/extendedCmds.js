`use strict`;

const Command = require("./Command");
const Database = require("../db/Database");
const db = require("../db");
const Scripts = require("../scripts");
const Config = require("../config");
const ImagesClient = require('google-images');

let GIS = new ImagesClient(Config.gisEID, Config.gisAPI);

let getError = cmd => {
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`
}

module.exports.getCommands = cmds => {

  cmds["jp"] = new Command(`Check how many Jolty points you currently have`, `jp`, 1, true, async (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let jp = await Scripts.getJP(msg.author.id);
    msg.channel.send(`${msg.member.nickname || msg.author.username}: You have ${jp} Jolty points`);
  });

  cmds["give"] = new Command(`Share your Jolty points with others`, `give <@user> <natural number 10 or higher>`, 1, true, async (msg, args, callback) => {
    if(args.length !== 3){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    if(args[1].slice(0, 2) !== "<@" && args[1].slice(-1) !== ">"){ callback(`You must specify someone using "@user"`); return; }
    if(parseInt(args[2]) != args[2] || args[2] < 10){ callback(`You must specify a natural number; 10 or higher (no fractions)`); return; }
    // Just double checking mhmhmhm
    args[2] = parseInt(args[2]);
    // Seeing as @mentions are displayed as <@number> we gotta pull some tricks to get the ID.
    args[1] = args[1].slice(2, -1);
    // Sometimes IDs have a ! in front for no reason, so we gotta check for that too and get rid of it.
    if(args[1].slice(0, 1) === "!") args[1] = args[1].slice(1);
    if(!msg.guild.member(args[1])){ callback(`The person you specified either doesn't exist, or is not in this server`); return; }
    if(args[1] === msg.author.id){ callback(`Try giving it to someone who isn't you`); return; }
    let target = await Scripts.getUser(args[1]);
    if(!target){ callback(`The person you specified is not enrolled in the extended Jolty program`); return; }
    let jp = await Scripts.getJP(msg.author.id);
    if(jp < args[2]){ callback(`You don't have enough Jolty points to give away that amount`); return; }
    Scripts.changeJP(msg.author.id, (-1 * args[2]));
    Scripts.changeJP(args[1], args[2]);
    msg.channel.send(`${msg.member.nickname || msg.author.username}: You gave ${args[2]} Jolty points to <@${args[1]}>. How generous!`);
    return;
  });

  cmds["gamble"] = new Command(`Gamble all your Jolty points away, or.. win big\nProbability: (20- = 50%) (50- = 48%) (100- = 45%) (200- = 40%) (500- = 35%) (1000- = 30%)`, `gamble (defaults to 20)\ngamble <integer amount greater than 5>`, 1, true, async (msg, args, callback) => {
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

  cmds["lvl"] = new Command(`See what level you have reached`, `lvl`, 1, true, async (msg, args, callback) => {
    if(args.length > 1){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let user = await Scripts.getUser(msg.author.id);
    let lvl = user.lvl;
    let xp = user.xp;
    let xpArray = require("../scripts/activityScript").xpArray;
    let xpLeft = xpArray[lvl - 1] - xp;
    msg.channel.send(`${msg.member.nickname || msg.author.username}: You are level \`${lvl}\`, with \`${xp}\` total XP.\nYou need \`${xpLeft}\` more XP to level up`);
  });

  cmds["bio"] = new Command(`Let people know about yourself or use it for something like friend codes and gamertags`, `bio set <bio goes here>\nbio view <@user>`, 1, true, async (msg, args, callback) => {
    if(args.length <= 2){ callback(getError(args[0].slice(Config.prefix.length))); return; }
    let method = args[1].toLowerCase();
    switch(method){
      case "set":
        let bio = msg.content.slice(msg.content.indexOf(args[2]));
        db.User.updateOne({disID: msg.author.id}, {$set: {bio: bio}}, (err) => {
          if(err) msg.channel.send(`\`\`\`js${err}\`\`\``);
          else{
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You have set your bio to:\n\`${bio}\``);
          }
        });
        break;
      case "view":
        let user = args[2];
        if(user.slice(0, 2) !== "<@" && user.slice(-1) !== ">"){ callback(`You must specify someone using "@user"`); return; }
        // Seeing as @mentions are displayed as <@number> we gotta pull some tricks to get the ID.
        user = user.slice(2, -1);
        // Sometimes IDs have a ! in front for no reason, so we gotta check for that too and get rid of it.
        if(user.slice(0, 1) === "!") user = user.slice(1);
        // Check bot's DB for user's Discord ID, if it doesn't exist it will return false
        userInfo = await Scripts.getUser(user);
        if(!msg.guild.member(user)){ callback(`The person you specified either doesn't exist, or is not in this server`); return; }
        if(!userInfo){ callback(`The person you specified is not whitelisted`); return; }
        if(userInfo.bio.length === 0){ callback(`The person you specified has no bio set`); return; }
        msg.channel.send(`${msg.member.nickname || msg.author.username}: Here is <@${user}>'s bio as requested:\n\`${userInfo.bio}\``);
        break;
      default:
        callback(getError(args[0].slice(Config.prefix.length))); return;
    }
    return;
  });

  cmds["df"] = new Command(`List the words you have defined, get a definition of an already-defined word, define a word that has not yet been claimed (50 JP), or redefine an already-defined word (300 JP)`, `\ndf list\ndf get <word>\ndf set <word> as <definition>\ndf reset <word> as <definition>`, 1, true, async (msg, args, callback) => {
    switch(args[1]){
      case "list":
        if(args.length > 2){ callback(getError(args[0].slice(Config.prefix.length))); break; }
        var user = await Scripts.getUser(msg.author.id);
        if(user.definitions.length === 0){ msg.channel.send(`${msg.member.nickname || msg.author.username}: you do not currently have anything defined`); return; }
        let definitions = "";
        for(let i = 0; i < user.definitions.length; i++){ definitions += `\`${user.definitions[i]}\`, `; }
        definitions = definitions.slice(0, -2);
        msg.channel.send(`${msg.member.nickname || msg.author.username}: You have defined the following words\n${definitions}`);
        break;
      case "get":
        if(args.length > 3){ callback(getError(args[0].slice(Config.prefix.length))); break; }
        var word = args[2].toLowerCase();
        var definition = await Scripts.getDef(word);
        if(!definition){ msg.channel.send(`${msg.member.nickname || msg.author.username}: There is no definition for \`${word}\` yet`); return; }
        msg.channel.send(`\`${definition.author}\` defined \`${word}\` as ${definition.description}`);
        break;
      case "set":
        if(args[3] !== "as"){ callback(getError(args[0].slice(Config.prefix.length))); break; }
        var word = args[2].toLowerCase();
        var definition = await Scripts.getDef(word);
        var user = await Scripts.getUser(msg.author.id);
        if(definition){ msg.channel.send(`${msg.member.nickname || msg.author.username}: \`${word}\` has already been defined`); break; }
        var cost = 50;
        if(user.jp < cost){ callback(`You don't have enough Jolty points`); break; }
        var description = msg.content.slice(msg.content.indexOf(" as ") + 4);
        user.jp -= cost;
        user.definitions.push(word);
        db.User.updateOne({disID: msg.author.id}, {$set: {jp: user.jp, definitions: user.definitions}}, (err) => {
          if(err) console.log(err);
          else{
            new db.Def({
              word: word,
              author: msg.author.username + "#" + msg.author.discriminator,
              authorID: msg.author.id,
              avatar: msg.author.avatarURL,
              description: description,
              timestamp: new Date()
            }).save(err => {
              if(err) console.log(err);
            });
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You have defined \`${word}\` as \`${description}\` for ${cost} Jolty points`);
          }
        });
        break;
      case "reset":
        if(args[3] !== "as"){ callback(getError(args[0].slice(Config.prefix.length))); break; }
        var word = args[2].toLowerCase();
        var definition = await Scripts.getDef(word);
        if(!definition){ msg.channel.send(`${msg.member.nickname || msg.author.username}: There is no definition for \`${word}\` yet`); break; }
        var cost = 300;
        var user = await Scripts.getUser(msg.author.id);
        if(user.jp < cost){ callback(`You don't have enough Jolty points`); break; }
        var description = msg.content.slice(msg.content.indexOf(" as ") + 4);
        user.jp -= cost;
        user.definitions.push(word);
        db.User.updateOne({disID: msg.author.id}, {$set: {jp: user.jp, definitions: user.definitions}}, (err) => {
          if(err) console.log(err);
          else{
            db.Def.updateOne({word: word}, {$set: {
              author: msg.author.username + "#" + msg.author.discriminator,
              authorID: msg.author.id,
              avatar: msg.author.avatarURL,
              description: description,
              timestamp: new Date()
            }}, (err) => {
              if(err) console.log(err);
            });
            msg.channel.send(`${msg.member.nickname || msg.author.username}: You have redefined \`${word}\` as: \n\`${description}\` for ${cost} Jolty points`);
          }
        });
        var otherUser = await Scripts.getUser(definition.authorID);
        if(otherUser){
          let wordCount = otherUser.definitions.reduce((n, x) => n + (x === word), 0);
          if(msg.author.id === otherUser.disID && wordCount > 1) otherUser.definitions.splice(otherUser.definitions.indexOf(word), 1);
          else if(msg.author.id !== otherUser.disID) otherUser.definitions.splice(otherUser.definitions.indexOf(word), 1);
          db.User.updateOne({disID: otherUser.disID}, {$set: {definitions: otherUser.definitions}}, (err) => {
            if(err) console.log(err);
          });
        }
        break;
      default:
        callback(getError(args[0].slice(Config.prefix.length)));
        break;
    }
    return;
  });

  cmds["gis"] = new Command(`Search Google Images with key words (10 JP)`, `gis <key words>`, 1, true, async (msg, args, callback) => {
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

  return cmds;

}
