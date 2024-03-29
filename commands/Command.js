"use strict";

class Command {
  constructor(description, usage, minRank, xP, dmEnabled, action) {
    this.description = description;
    this.usage = usage;
    this.minRank = minRank;
    this.extProgram = xP;
    this.dmEnabled = dmEnabled;
    this.execute = action;
  }

  canUse(rank) {
    if (rank >= this.minRank) return 1;
    return 0;
  }
}

module.exports = Command;