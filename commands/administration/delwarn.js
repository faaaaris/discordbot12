const Discord = require("discord.js");
const logger = require("../../utils/logger");
const { dbQueryNoNew, dbModify } = require("../../utils/db");

module.exports = {
    name: "delwarn",
    category: "moderator",
    description: "Delete a single warning for a member",
    usage: ["[case Id]"],
    aliases: [],
    cooldown: 2,
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;
      
        if(!args[0]) return bot.commands.get("help").run(bot, message, ["delwarn"]);

        let warning = await dbQueryNoNew("Modlog", { guild: message.guild.id, type: "Warn", deleted: false, caseId: Number(args[0]) })
        if (!warning) return message.reply({ embeds: [bot.logger.err(`That warning doesn't exist.`)] })

        warning.deleted = true;
        await dbModify("Modlog", { guild: message.guild.id, type: "Warn", deleted: false, caseId: Number(args[0]) }, warning);

        message.reply({ embeds: [bot.logger.success(`Deleted warning \`${args[0]}\` for ${warning.user.tag}`)] })
    }
}