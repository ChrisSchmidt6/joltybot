`use strict`;

const Basic = require("./basic");
const Extended = require("./extended");
const Moderator = require("./mod");
const SuperMod = require("./superMod");
const Owner = require("./owner");

let cmds = {};

cmds = Basic.getCommands(cmds);
cmds = Extended.getCommands(cmds);
cmds = Moderator.getCommands(cmds);
cmds = SuperMod.getCommands(cmds);
cmds = Owner.getCommands(cmds);

module.exports = cmds;