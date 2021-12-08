const Discord = require("discord.js");
const logger = require("../../utils/logger");
const { Modlog } = require("../../utils/schemas");

module.exports = {
    name: "unban",
    category: "moderator",
    description: "Unban a user",
    usage: ["[user id] [reason]"],
    aliases: [],
    cooldown: 3,
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args[0]) return bot.commands.get("help").run(bot, message, ["unban"]);

        if (isNaN(args[0])) return message.reply({ embeds: [bot.logger.err(`You need to provide a user ID.`)] })

        const user = await bot.users.fetch(args[0]);
        if (!user) return message.reply({ embeds: [bot.logger.err(`Invalid user ID.`)] })

        const reason = args.slice(1).join(" ") || "No reason given.";
        const currentCaseId = await bot.db.get("currentCaseId") || 0;

        let banList = await message.guild.bans.fetch()
        let findUser = banList.find(user => user.user.id === args[0]);
        if (!findUser) return message.reply({ embeds: [bot.logger.info(`${user.tag} isn't banned from the server.`)] })

        await new Modlog({
            guild: message.guild.id,
            type: "Unban",
            user: { id: user.id, tag: user.tag },
            moderator: { id: message.author.id, tag: message.author.tag },
            caseId: currentCaseId + 1,
            reason: reason,
            timestamp: Date.now(),
        }).save();
        bot.util.updateCaseId(bot.db);
        
        try {
            await message.guild.members.unban(user, reason);

            message.reply({ embeds: [bot.logger.success(`***${user.tag} has been unbanned*** | ${reason}`)] })
        } catch (e) {
            if (e) return message.reply({ embeds: [bot.logger.err(`An error occured: ${e.message}`)] })
        }
    }
}