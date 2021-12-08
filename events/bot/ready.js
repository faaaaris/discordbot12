const { bot } = require("../../index");
const Discord = require("discord.js");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");

module.exports = () => {
    console.log(`🆗 Logged in as ${bot.user.username}`);
}