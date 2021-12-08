const { Schema, model } = require("mongoose");

const points = new Schema({
    guildId: { type: String, required: true },
    robloxId: { type: Number, required: true },
    amount: { type: Number, default: 0 }
});

const modlog = new Schema({
    guild: { type: String, required: true },
    type: { type: String },
    deleted: { type: Boolean, default: false },
    user: {
        id: { type: String },
        tag: { type: String }
    },
    moderator: {
        id: { type: String },
        tag: { type: String }
    },
    caseId: { type: Number },
    reason: { type: String },
    timestamp: { type: Date },
});

module.exports = {
    Points: model("points", points, "points"),
    Modlog: model("modlogs", modlog, "modlogs")
}