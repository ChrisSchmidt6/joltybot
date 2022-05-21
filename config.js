`use strict`;

module.exports = {
  //token: "", // for production)
  token: "", // (for development) [This is if you want to be able to test changes while an older version is still running]
  devServer: "", // Server / Guild ID where the development happens, the bot's "home" Guild
  suggestionChannel: "", // Channel ID of the channel where all suggestions are sent
  database: "mongodb://127.0.0.1:27017/jolty", // Can be renamed, by default set to jolty
  prefix: "j.", // Prefix to server commands
  owner: "", // Discord User ID of bot owner
  gisEID: "", // Google Image Search Engine ID
  gisAPI: "", // Google Image Search API key
};
