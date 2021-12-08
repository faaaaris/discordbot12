const Discord = require("discord.js");
const config = require("../../config.json");
const logger = require("../../utils/logger");
const moment = require("moment");
const { dbQueryNoNew } = require("../../utils/db");

module.exports = {
    name: "case",
    category: "moderator",
    description: "Show a single moderation case.",
    usage: ["[case Id]"],
    aliases: [],
    cooldown: 2,
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args[0]) return bot.commands.get("help").run(bot, message, ["case"]);

        let caseInfo = await dbQueryNoNew("Modlog", { guild: message.guild.id, caseId: Number(args[0]) });
        if (!caseInfo) return message.reply({ embeds: [bot.logger.err(`Case ${args[0]} not found.`)] })

        let embed = new Discord.MessageEmbed()
            .setAuthor(`Case ${args[0]} | ${caseInfo.type} | ${caseInfo.user.tag}`)
            .setDescription(caseInfo.reason)
            .setFooter(`ID: ${caseInfo.user.id}`)
            .setTimestamp(caseInfo.timestamp)
            .setColor(config.colors.blue)
            .addFields(
                { name: "User", value: caseInfo.user.tag, inline: true },
                { name: "Moderator", value: `<@!${caseInfo.moderator.id}>`, inline: true },
            )

        message.channel.send({ embeds: [embed] });
    }
}