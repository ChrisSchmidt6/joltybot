`use strict`;

const Database = require("./db/Database");
let _settings = Database.get("settings");

module.exports = {
  //token: "", // Jolty (for production)
  token: "", // Eevee (for development) [This is if you want to be able to test changes while an older version is still running]
  devServer: "", // Server / Guild ID where the development happens, the bot's "home" Guild
  suggestionChannel: "", // Channel ID of the channel where all suggestions are sent
  database: 'mongodb://localhost:27017/jolty',
  prefix: _settings.prefix,
  owner: _settings.owner, // Make sure to change the owner's Discord ID in ./db/settings.json
  gisEID: _settings.gisEID,
  gisAPI: _settings.gisAPI
}
