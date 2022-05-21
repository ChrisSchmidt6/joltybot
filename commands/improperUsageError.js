`use strict`;

const Config = require("../config");

const getError = (msg, args) => {
  let cmd = args[0];
  if (msg.guildId !== null) cmd = cmd.slice(Config.prefix.length);
  return `The \`${cmd}\` command was not used properly. Try again or use the \`help\` command for more information`;
};

module.exports = getError;