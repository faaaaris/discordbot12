const Discord = require("discord.js");
const fetch = require("node-fetch");
const { dbQuery, dbQueryNoNew, dbModify, dbQueryAll } = require("../../utils/db");

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
    name: "add",
    category: "points",
    description: "Remove points from a user.",
    usage: ["[user] [amount]"],
    aliases: [],
    cooldown: 0,
    run: async (bot, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === bot.config.logChannel);

        if (
            !message.member.hasPermission("ADMINISTRATOR") &&
            !message.member.roles.cache.some(r => bot.config.xpPerms.includes(r.name))
        ) return;

        if (!args[0]) return bot.commands.get("help").run(bot, message, ["remove"]);

        const user = args[0];
        const amount = args[1];

        if (!user) return bot.commands.get("help").run(bot, message, ["remove"]);
        if (!amount) return bot.commands.get("help").run(bot, message, ["remove"]);
        if (isNaN(amount)) return message.reply({ embeds: [bot.logger.err("XP value must be a number.")] });
        if (Number(amount) <= 0) return message.reply({ embeds: [bot.logger.err("XP value must be a positive number.")] });
        if (Number(amount) % 1 !== 0) return message.reply({ embeds: [bot.logger.err("XP value must be a whole number without decimals.")] });

        let res = await fetch(`https://api.roblox.com/users/get-by-username?username=${user}`);
        let body = await res.json();

        if (body.success === false) return message.reply({ embeds: [bot.logger.err(`${user} does not exist on ROBLOX.`)] });
        else {
            let userID = await bot.rbx.getIdFromUsername(user);
            let qUserDB = await dbQuery("Points", { robloxId: userID, guildId: bot.config.guildId });
            let currentXp = qUserDB.amount || 0;

            if (currentXp < Number(amount)) return message.reply({ embeds: [bot.logger.err("User has less points than the specified amount.")] })

            qUserDB.amount = currentXp + Number(amount);
            await dbModify("Points", { robloxId: userID, guildId: bot.config.guildId }, qUserDB);

            message.reply({ embeds: [bot.logger.success(`Removed ${amount} points from ${user}'s profile.`)] });

            let currentRankId = await bot.rbx.getRankInGroup(bot.config.groupId, userID);
            let currentRankName = await bot.rbx.getRankNameInGroup(bot.config.groupId, userID);
            let rblxUsername = await bot.rbx.getUsernameFromId(userID);

            if (logChannel) logChannel.send({ embeds: [bot.logger.info(`${message.author} removed ${amount} points from ${rblxUsername}`)] });

            let rankName;
            let requiredAmount;
            let rankId;

            let rankData = ranks[currentRankName]
            if (!rankData) {
                rankName = "[ERROR] || CAN'T GO BEYOND";
                requiredAmount = 0;
                rankId = 255;
            } else {
                rankName = rankData.rankName;
                requiredAmount = rankData.requiredAmount;
                rankId = currentRankId - 1;
            }

            if ((currentXp - Number(amount)) < requiredAmount && currentRankId < 25 && currentRankId > 0) {
                let newRank = await bot.util.setRank(bot.config.groupId, userID, rankName)
                    .then(async () => {
                        if (logChannel) {
                            let rblxUsername = await bot.rbx.getUsernameFromId(userID);
                            logChannel.send({ embeds: [bot.logger.info(`Promoted **${rblxUsername}** to **${newRank.name}**`)] });
                        }
                    })
                    .catch(() => undefined);
            }
        }
    }
}