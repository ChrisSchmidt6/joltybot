`use strict`;

const Database = require("../db/Database");
const db = require("../db");
const Scripts = require("../scripts");

const Experience = [
  60, 160, 256, 382, 539, 731, 961, 1232, 1546, 1906, 2316, 2778, 3294, 3868,
  4502, 5198, 5960, 6790, 7690, 8663, 9711, 10837, 12044, 13334, 14709, 16171,
  17723, 19368, 21108, 22945, 24881, 26919, 29061, 31309, 33666, 36134, 38715,
  41411, 44225, 47159, 50215, 53395, 56701, 60136, 63702, 67401, 71235, 75206,
  79317, 83570, 87966, 92508, 97198, 102038, 107030, 112176, 117479, 122940,
  128561, 134345, 140294, 146409, 152692, 159146, 165773, 172575, 179554,
  186711, 194048, 201568, 209273, 217165, 225246, 233518, 241982, 250640,
  259495, 268549, 277803, 287259, 296920, 306788, 316864, 327150, 337648,
  348360, 359288, 370434, 381800, 393387, 405198, 417235, 429499, 441992,
  454716, 467673, 480865, 494294, 507962,
];

module.exports.xpArray = Experience;

module.exports.check = async (user) => {
  user = user.author;
  let _settings = { ...Database.get("settings") };
  let userDB = await Scripts.getUser(user.id);
  let temp = await Scripts.getTempUser(user.id);
  const tempCopy = temp;
  if (!userDB) return;
  const currentDate = new Date();
  if (!temp) {
    temp = new db.TempUser({
      _id: user.id,
      intervalDate: currentDate,
    });
  }
  if (currentDate.getHours() !== temp.intervalDate.getHours()) {
    _settings.currentDate = currentDate;
    Database.update("settings", _settings);
    // This will run for the first message sent in the new hour,
    // so all tempUser entries should be deleted as they will be outdated
    await db.TempUser.deleteMany().exec((err) => {
      if (err) console.log(err);
    });
    temp = new db.TempUser({
      _id: user.id,
      intervalDate: currentDate,
    });
  }
  if (
    Math.floor(temp.intervalDate.getMinutes() / 10) !==
    Math.floor(currentDate.getMinutes() / 10)
  ) {
    if (
      Math.floor(temp.intervalDate.getMinutes() / 10) + 1 ==
      Math.floor(currentDate.getMinutes() / 10)
    ) {
      temp.consecutive++;
    } else temp.consecutive = 0;

    temp.intervalDate = currentDate;
    temp.thisInterval = 0;
    temp.save((err) => {
      if (err) console.log(err);
    });
  } else {
    if (temp.thisInterval >= 20 || temp.thisHour >= 80) return;
    temp.thisInterval++;
    temp.thisHour++;
    userDB.jp += 1 + Math.floor(temp.consecutive / 3);
    let xp = 2;
    if (temp.consecutive >= 3) xp++;
    xp += Math.floor(userDB.lvl / 5);
    userDB.xp += xp;
    if (userDB.xp >= Experience[userDB.lvl - 1]) {
      userDB.lvl++;
    }
    userDB.save((err) => {
      if (err) console.log(err);
    });
    temp.save((err) => {
      if (err) {
        console.log(err);
      }
    });
  }
  return;
};
