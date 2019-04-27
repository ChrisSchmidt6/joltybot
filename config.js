`use strict`;

const Database = require("./db/Database");
let _settings = Database.get("settings");

module.exports = {
  token: "",
  database: 'mongodb://localhost:27017/jolty',
  prefix: _settings.prefix,
  owner: _settings.owner, // This would be I, muahahahaha!
  gisEID: _settings.gisEID, // blanked out as you'll have to get your own gisEID
  gisAPI: _settings.gisAPI // read line above, same applies here
}
