const Discord = require("discord.js");
const logger = require("../../utils/logger");
const { dbQueryAll, dbModifyAll } = require("../../utils/db");

module.exports = {
    name: "clearwarn",
    category: "moderator",
    description: "Clear warnings for a user.",
    usage: ["[user]"],
    aliases: [],
    cooldown: 5,
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args.join(" ")) return bot.commands.get("help").run(bot, message, ["clearwarn"]);

        let target = bot.util.resolveMember(message, args.join(" "));
        if (!target) return message.reply({ embeds: [bot.logger.err(`Couldn't find user ${args.join(" ")}`)] })

        let warnings = await dbQueryAll("Modlog", { guild: message.guild.id, type: "Warn", deleted: false, "user.id": target.user.id });

        if (warnings.length === 0 || !warnings) return message.reply({ embeds: [bot.logger.err(`No warnings found for ${target}`)] })

        let amount = warnings.length === 1 ? `1 warning` : `${warnings.length} warnings`;
        await dbModifyAll("Modlog", { guild: message.guild.id, type: "Warn", "user.id": target.user.id }, { deleted: true });

        message.reply({ embeds: [bot.logger.success(`Cleared ${amount} for ${target.user.tag}`)] });
    }
}