const Discord = require("discord.js");
const logger = require("../../utils/logger");
const { Modlog } = require("../../utils/schemas");

module.exports = {
    name: "ban",
    category: "moderator",
    description: "Ban a member",
    usage: ["[user] [reason]"],
    aliases: [],
    cooldown: 2,
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args[0]) return bot.commands.get("help").run(bot, message, ["ban"]);

        let target = bot.util.resolveMember(message, args[0]);
        if (!target) return message.reply({ embeds: [bot.logger.err(`Couldn't find user ${args[0]}`)] })

        const reason = args.slice(1).join(" ") || "No reason given.";
        const currentCaseId = await bot.db.get("currentCaseId") || 0;

        if (target.user.id === message.author.id) return message.reply({ embeds: [bot.logger.err("You can't ban yourself.")] });

        if (!target.bannable) return message.reply({ embeds: [bot.logger.err(`I can't ban that user.`)] })

        if (
            !target.roles.cache.some(r => bot.config.modRoles.includes(r.id)) ||
            !target.hasPermission("ADMINISTRATOR")
        ) {
            await new Modlog({
                guild: message.guild.id,
                type: "Ban",
                user: { id: target.user.id, tag: target.user.tag },
                moderator: { id: message.author.id, tag: message.author.tag },
                caseId: currentCaseId + 1,
                reason: reason,
                timestamp: Date.now(),
            }).save();
            bot.util.updateCaseId(bot.db);
            
            await target.send({ content: `You have been banned from ${message.guild.name}. Reason: ${reason}` }).catch(() => false);
            target.ban({ reason: reason, days: 7 }).catch(err => {
                if (err) return message.reply({ embeds: [bot.logger.err(`An error occured: ${err.message}`)] })
            });

            message.reply({ embeds: [bot.logger.success(`Case \`${currentCaseId + 1}\`\n***${target.user.tag} has been banned*** | ${reason}`)] })
        } else {
            return message.reply({ embeds: [bot.logger.err(`That user is a mod/admin, I can't do that.`)] })
        }
    }
}