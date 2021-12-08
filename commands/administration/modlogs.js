const Discord = require("discord.js");
const _ = require("lodash");
const moment = require("moment");
const logger = require("../../utils/logger");
const { dbQueryAll } = require("../../utils/db");

module.exports = {
    name: "modlogs",
    category: "moderator",
    description: "Get a list of moderation logs for a user.",
    usage: ["<user>"],
    aliases: [],
    cooldown: 2,
    example: ["modlogs @faris#9999"],
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args.join(" ")) return bot.commands.get("help").run(bot, message, ["modlogs"]);
        let target = bot.util.resolveMember(message, args.join(" "));

        if (!target && !isNaN(args[0])) {
            let data = await dbQueryAll("Modlog", { guild: message.guild.id, "user.id": args[0] });

            if (!data || data.length === 0) return message.reply({ embeds: [bot.logger.info("No logs found.")] })

            let arr = [];
            for (let i = 0; i < data.length; i++) {
                arr.push([
                    `**Case ${data.caseId}**`,
                    `**Type:** ${data.type}`,
                    `**User:** (${data.user.id}) ${data.user.tag}`,
                    `**Moderator:** ${data.moderator.tag}`,
                    `**Reason:** ${data.reason} - ${moment.utc(data.timestamp).format("MMM D YYYY HH:mm:ss")}`,
                ].join("\n"))
            }

            let chunked = _.chunk(arr, 10);

            let embeds = [];

            for (let i = 0; i < chunked.length; i++) {
                embeds.push(new Discord.MessageEmbed()
                    .setAuthor(`Viewing page {{current}}/{{total}}`, bot.user.displayAvatarURL())
                    .setColor(bot.config.colors.blue)
                    .setDescription(chunked[i].join("\n"))
                    .setFooter(length === 1 ? "1 Log Found" : `${length} Logs Found`)
                )
            }

            return bot.util.pages(message, embeds);
        }

        if (!target) return message.reply({ embeds: [bot.logger.err(`Couldn't find user ${args.join(" ")}`)] })

        let data = await dbQueryAll("Modlog", { guild: message.guild.id, "user.id": target.user.id });

        if (!data || data.length === 0) return message.reply({ embeds: [bot.logger.info("No logs found.")] })

        let arr = [];
        for (let i = 0; i < data.length; i++) {
            arr.push([
                `**Case ${data[i].caseId}**`,
                `**Type:** ${data[i].type}`,
                `**User:** (${data[i].user.id}) ${data[i].user.tag}`,
                `**Moderator:** ${data[i].moderator.tag}`,
                `**Reason:** ${data[i].reason} - ${moment.utc(data[i].timestamp).format("MMM D YYYY HH:mm:ss")}`,
            ].join("\n"))
        }

        let chunked = _.chunk(arr, 10);
        let embeds = [];

        for (let i = 0; i < chunked.length; i++) {
            embeds.push(new Discord.MessageEmbed()
                .setAuthor(`Viewing page {{current}}/{{total}}`, bot.user.displayAvatarURL())
                .setColor(bot.config.colors.blue)
                .setDescription(chunked[i].join("\n"))
                .setFooter(data.length === 1 ? "1 Log Found" : `${data.length} Logs Found`, target.user.displayAvatarURL({ dynamic: true }))
            )
        }

        bot.util.pages(message, embeds);
    }
}