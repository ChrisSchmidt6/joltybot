`use strict`;

const fs = require("fs");
const path = require("path");

const modelsPath = path.resolve(__dirname);
fs.readdirSync(modelsPath).forEach((file) => {
  if (file !== "index.js") {
    this[
      file.slice(0, 1).toUpperCase() + file.slice(1, -4)
    ] = require(modelsPath + "/" + file);
  }
});
