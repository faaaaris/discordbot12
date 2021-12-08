const Discord = require("discord.js");
const fetch = require("node-fetch");
const { dbQuery, dbQueryNoNew, dbQueryAll } = require("../../utils/db");
const moment = require("moment");
require("moment-duration-format");

const ranks = {
    "Guest": {
        rankName: "Private",
        requiredAmount: 0,
        rankId: 1,
    },
    "Private": {
        rankName: "Private First Class",
        requiredAmount: 5,
        rankId: 4,
    },
    "Private First Class": {
        rankName: "Specalist",
        requiredAmount: 10,
        rankId: 6,
    },
    "Specalist": {
        rankName: "Lance Corporal",
        requiredAmount: 15,
        rankId: 7,
    },
    "Lance Corporal": {
        rankName: "Corporal",
        requiredAmount: 20,
        rankId: 8,
    },
    "Corporal": {
        rankName: "Sergeant",
        requiredAmount: 25,
        rankId: 12
    },
    "Sergeant": {
        rankName: "Sergeant Major",
        requiredAmount: 30,
        rankId: 19,
    },
    "Sergeant Major": {
        rankName: "Master Sergeant",
        requiredAmount: 35,
        rankId: 20,
    },
    "Master Sergeant": {
        rankName: "Warrant Officer",
        requiredAmount: 40,
        rankId: 21,
    },
    "Warrant Officer": {
        rankName: "Lieutenant",
        requiredAmount: 45,
        rankId: 22,
    },
    "Lieutenant": {
        rankName: "Captain",
        requiredAmount: 50,
        rankId: 23,
    },
    "Captain": {
        rankName: "Commander",
        requiredAmount: 55,
        rankId: 24,
    },
    null: {
        rankName: "[ERROR] || CAN'T GO BEYOND",
        requiredAmount: 0,
        rankId: 255,
    }
}

module.exports = {
    name: "view",
    category: "points",
    description: "View your Relics stats.",
    usage: ["[username]"],
    cooldown: 2,
    aliases: [],
    run: async (bot, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === bot.config.logChannel);
        let userID;
        let rblxUsername;

        if (!args[0]) {
            let res = await fetch(`https://api.blox.link/v1/user/${message.author.id}`);
            let data = await res.json();

            if (data.status === "ok") {
                userID = data.robloxId;
                rblxUsername = await bot.rbx.getUsernameFromId(data.robloxId);
            } else {
                return message.reply({ embeds: [bot.logger.err("You are not verified, click [here](https://blox.link/verify) to verify.")] });
            }
        } else {
            let res = await fetch(`https://api.roblox.com/users/get-by-username?username=${args[0]}`);
            let data = await res.json();

            if (data.success === false) return message.reply({ embeds: [bot.logger.err(`${args[0]} does not exist on ROBLOX.`)] });
            else {
                userID = data.Id;
                rblxUsername = data.Username;
            }
        }

        //let currentRankId = await bot.rbx.getRankInGroup(bot.config.groupId, userID);
        let currentRankName = await bot.rbx.getRankNameInGroup(bot.config.groupId, userID);

        let rankName;
        let requiredAmount;

        let rankData = ranks[currentRankName]
        if (!rankData) {
            rankName = "[ERROR] || CAN'T GO BEYOND";
            requiredAmount = 0;
        } else {
            rankName = rankData.rankName;
            requiredAmount = rankData.requiredAmount;
        }

        let qUserDB = await dbQuery("Points", { robloxId: userID, guildId: bot.config.guildId });
        let currentXp = qUserDB.amount || 0;

        let usernameHeader = `[View User Profile](https://www.roblox.com/users/${userID}/profile)`;
        let currentRankAndPoints = `**${rankName} - Currently has ${currentXp} Relics**`;

        //let percentage = Math.round(((currentXp > requiredAmount ? requiredAmount : currentXp + currentScrolls > requiredScrolls ? requiredScrolls : currentScrolls) / (requiredAmount + requiredScrolls)) * 100);
        let percentage = Math.round((currentXp) / requiredAmount) * 100;
        if (isNaN(percentage)) percentage = 0;
        if (percentage > 100) percentage = 100;

        let percentBar;
        if (percentage === 0) {
            percentBar =
                ":white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:";
        } else if (0 <= percentage && percentage <= 10) {
            percentBar =
                ":white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:";
        } else if (10 <= percentage && percentage <= 20) {
            percentBar =
                ":white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:";
        } else if (20 <= percentage && percentage <= 30) {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:";
        } else if (30 <= percentage && percentage <= 40) {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:";
        } else if (40 <= percentage && percentage <= 50) {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:";
        } else if (50 <= percentage && percentage <= 60) {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button:";
        } else if (60 <= percentage && percentage <= 70) {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button:";
        } else if (70 <= percentage && percentage <= 80) {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button:";
        } else if (80 <= percentage && percentage <= 90) {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button:";
        } else {
            percentBar =
                ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square:";
        }

        let remainingErorNumber = Number(requiredAmount - currentXp);
        let remainingScrollsNumber = Number(requiredScrolls - currentScrolls) <= 0 ? 0 : Number(requiredScrolls - currentScrolls);
        if (remainingErorNumber <= 0) {
            remainingErorNumber = "0";
        }

        let resp = await fetch(`https://www.roblox.com/headshot-thumbnail/json?userId=${userID}&width=180&height=180`);
        let parsed = await resp.json();
        let mugshot = parsed.Url;

        let remainingError = [
            `**${remainingErorNumber}** Relics remaining for **${rankName} (${requiredAmount} Relics)**`,
            `**${remainingScrollsNumber}** Scrolls remaining for **${rankName} (${requiredScrolls} Scrolls)**`
        ].join("\n");

        let response = new Discord.MessageEmbed()
            .setThumbnail(mugshot)
            .setColor(bot.config.colors.red)
            .setTitle(`${rblxUsername} - Progress`)
            .setDescription([
                `${percentBar} ${percentage}%`,
                ``,
                `**Rank:** ${currentRankName}`,
                `**Points:** ${currentXp}`,
                ``,
                `${remainingError}`,
                ``,
                `${usernameHeader}`
            ].join("\n"))

        message.reply({ embeds: [response] });
    }
}