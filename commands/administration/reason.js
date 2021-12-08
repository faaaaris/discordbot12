const Discord = require("discord.js");
const logger = require("../../utils/logger");
const { dbQueryNoNew, dbModify } = require("../../utils/db");

module.exports = {
    name: "reason",
    category: "moderator",
    description: "Supply a reason for a mod log case.",
    usage: ["[case Id] [reason]"],
    aliases: [],
    cooldown: 3,
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args[0]) return bot.commands.get("help").run(bot, message, ["reason"]);

        const reason = args.slice(1).join(" ");
        if (!reason) return bot.commands.get("help").run(bot, message, ["reason"]);

        let log = await dbQueryNoNew("Modlog", { guild: message.guild.id, deleted: false, caseId: Number(args[0]) });
        if (!log) return message.reply({ embeds: [bot.logger.err("I couldn't find that log entry")] })

        log.reason = reason;
        await dbModify("Modlog", { guild: message.guild.id, deleted: false, caseId: Number(args[0]) }, log);

        message.reply({ embeds: [bot.logger.success(`Changed reason for case #${args[0]}`)] })
    }
}