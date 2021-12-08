const Discord = require("discord.js");
const logger = require("../../utils/logger");
const { Modlog } = require("../../utils/schemas");

module.exports = {
    name: "warn",
    category: "moderator",
    description: "Warn a member",
    usage: ["<user> [reason]"],
    cooldown: 2,
    aliases: [],
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args[0]) return bot.commands.get("help").run(bot, message, ["warn"]);

        let target = bot.util.resolveMember(message, args[0]);
        if (!target) return message.reply({ embeds: [bot.logger.err(`Couldn't find user ${args[0]}`)] })

        const reason = args.slice(1).join(" ") || "No reason given.";
        const currentCaseId = await bot.db.get("currentCaseId") || 0;

        await new Modlog({
            guild: message.guild.id,
            type: "Warn",
            user: { id: target.user.id, tag: target.user.tag },
            moderator: { id: message.author.id, tag: message.author.tag },
            caseId: currentCaseId + 1,
            reason: reason,
            timestamp: Date.now()
        }).save();
        bot.util.updateCaseId(bot.db);

        try {
          target.send({ content: [
            `You have been warned in ${message.guild.name}.`,
            `Reason: ${reason}`
          ].join("\n") });
          message.reply({ embeds: [bot.logger.success([
            `Case \`${currentCaseId + 1}\``,
            `***${target.user.tag} has been warned*** | ${reason}`
          ].join("\n"))] })
        } catch (err) {
          message.reply({ embeds: [bot.logger.success([
            `Case \`${currentCaseId + 1}\``,
            `***Warning logged for ${target.user.tag}. I couldn't DM them.***`
          ].join("\n"))] })
        }
    }
}