`use strict`;

const db = require('../db');

module.exports.getUser = async (id) => {
    const query = db.User.findOne({disID: id}, {__v: 0}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data;
    return false;
}

module.exports.getDef = async (word) => {
    const query = db.Def.findOne({word: word}, {_id: 0, __v: 0}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data;
    return false;
}

module.exports.getRank = async (id) => {
    const query = db.User.findOne({disID: id}, {grank: 1}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data.grank;
    return 1;
}

module.exports.setRank = async (rank, userId) => {
    const update = db.User.update({disID: userId}, {$set: {grank: rank}}, (err) => {
        if(err){ console.log(err); return false; }
        else return true;
    });
    const data = await update.exec();
    if(data) return true;
    return false;
}

module.exports.getLvl = async (id) => {
    const query = db.User.findOne({disID: id}, {lvl: 1}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data.lvl;
    return 0;
}

module.exports.getXP = async (id) => {
    const query = db.User.findOne({disID: id}, {xp: 1}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data.xp;
    return 0;
}

module.exports.getJP = async (id) => {
    const query = db.User.findOne({disID: id}, {jp: 1}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data.jp;
    return 0;
}

module.exports.changeJP = async (userId, amount) => {
    const query = db.User.findOne({disID: userId}, {jp: 1}, (err) => {
        if(err) console.log(err);
    });
    const execQuery = await query.exec();
    let jp = execQuery.jp;
    jp += amount;
    const update = db.User.updateOne({disID: userId}, {$set: {jp: jp}}, (err) => {
        if(err){ console.log(err); return false; }
        else return true;
    });
    const data = await update.exec();
    if(data) return true;
    return false;
}

module.exports.getPoll = async (id) => {
    const query = db.Poll.findOne({_id: id}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data;
    return false;
}

module.exports.getTempPoll = async (id) => {
    const query = db.TempPoll.findOne({_id: id}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data;
    return false;
}

module.exports.getTempUser = async (id) => {
    const query = db.TempUser.findOne({_id: id}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data;
    return false;
}

module.exports.getBlacklist = async (type, id) => {
    const query = db.Blacklist.findOne({$and: [{type: type}, {_id: id}]}, (err) => {
        if(err) console.log(err);
    });
    const data = await query.exec();
    if(data) return data;
    return false;
}