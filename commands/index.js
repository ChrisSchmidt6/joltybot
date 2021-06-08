`use strict`;

let Basic = require("./basic");
let Extended = require("./extended");
let Moderator = require("./mod");
let SuperMod = require("./superMod");
let Owner = require("./owner");

let cmds = {};

cmds = Basic.getCommands(cmds);
cmds = Extended.getCommands(cmds);
cmds = Moderator.getCommands(cmds);
cmds = SuperMod.getCommands(cmds);
cmds = Owner.getCommands(cmds);

module.exports = cmds;