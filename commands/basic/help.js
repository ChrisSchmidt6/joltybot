`use strict`;

const Config = require('../../config');
const Scripts = require("../../scripts");
const Command = require("../Command");

const getError = require("../improperUsageError");

module.exports.create = (cmds) => {
  let cmd = new Command(
    `Get general help or get information on a command`, // Description
    `\`help\`\n\`help <command name>\``, // Command examples
    1, // Minimum rank
    false, // 'Extended Jolty Program' command
    true, // Direct Message enabled
    // Command execution >>
    async (msg, args, callback) => {
      if (args.length > 1) {
        if (args.length > 2) {
          callback(getError(msg, args));
          return;
        }
        if (!cmds[args[1].toLowerCase()]) {
          callback(`You must specify an existing command. To list your commands, use the \`help\` command.`);
          return;
        }
        msg.reply({
          content: `The description of \`${args[1].toLowerCase()}\` is \`${
            cmds[args[1].toLowerCase()].description
          }\`.${cmds[args[1]].dmEnabled ? '' : '\nThis command is not enabled in Direct Messages.'}\nHow you should use the command:\n${
            cmds[args[1].toLowerCase()].usage
          }`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }
      let userCmds = ``;
      let rank = await Scripts.getRank(msg.author.id);
      let user = await Scripts.getUser(msg.author.id);
      if (rank < 2 && msg.member.permissions.has("KICK_MEMBERS")) rank = 2;
      for (cmd in cmds) {
        if (rank >= cmds[cmd].minRank && !cmds[cmd].extProgram) {
          userCmds += `\`${cmd}\`, `;
        }
        if (rank >= cmds[cmd].minRank && cmds[cmd].extProgram && user) {
          userCmds += `\`${cmd}\`, `;
        }
      }
      if (user) userCmds = userCmds.replace("`enroll`, ", "");
      if (msg.guildId !== null) {
        msg.reply({
          content: `Please check your Direct Messages :grinning:`,
          allowedMentions: { repliedUser: false },
        });
      }
      msg.author.send(
        `You can use certain commands in Direct Messages or all commands in a server. Server commands require the \`${
          Config.prefix
        }\` prefix.\nFor help with a specific command, type \`${
          Config.prefix
        }help <command>\` in a server or \`help <command>\` in Direct Messages\n${
          user
            ? ""
            : `If you want to enroll in the extended Jolty program, use the \`enroll\` command.\n`
        }You have access to the following commands:\n${userCmds.slice(0, -2)}`
      );
      return;
    }
  );
  return cmd;
};
