const Discord = require("discord.js");
const logger = require("../../utils/logger");
const _ = require("lodash");
const moment = require("moment");
const { dbQueryAll } = require("../../utils/db");

module.exports = {
    name: "warnings",
    category: "moderator",
    description: "Get warnings for a user.",
    usage: ["[user]"],
    aliases: [],
    cooldown: 4,
    run: async (bot, message, args) => {
        if (
            !message.member.roles.cache.some(r => bot.config.modRoles.includes(r.name)) &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) return;

        if (!args.join(" ")) return bot.commands.get("help").run(bot, message, ["warnings"]);

        let target = bot.util.resolveMember(message, args.join(" "));
        if (!target) return message.reply({ embeds: [bot.logger.err(`Couldn't find user ${args.join(" ")}`)] })

        let data = await dbQueryAll("Modlog", { "user.id": target.user.id, guild: message.guild.id, type: "Warn", deleted: false })

        if (!data || data.length === 0) return message.reply({ embeds: [bot.logger.info("There are no warnings.")] })

        let embeds = [];

        const fieldName = [];
        const fieldValue = [];
        for (let i = 0; i < data.length; i++) {
            fieldName.push(`ID: ${data[i].caseId} | Moderator: ${data[i].moderator.tag}`);
            fieldValue.push(`${data[i].reason} - ${moment.utc(data[i].timestamp).format("MMM D YYYY")}`)
        }

        let chunkedName = _.chunk(fieldName, 8),
            chunkedValue = _.chunk(fieldValue, 8);

        for (let i = 0; i < chunkedName.length; i++) {
            let author;
            if (chunkedName.length === 1) author = `Viewing page 1/1`
            else author = `Viewing page {{current}}/{{total}}`
            let embed = new Discord.MessageEmbed()
                .setAuthor(`Viewing page {{current}}/{{total}}`, bot.user.displayAvatarURL())
                .setFooter(`${data.length === 1 ? `1 Warning` : `${data.length} Warnings`} found for ${target.user.tag} (${target.user.id})`, target.user.displayAvatarURL({ dynamic: true }))
                .setColor(bot.config.colors.blue)

            for (let x = 0; x < chunkedName[i].length; x++) {
                embed.addField(chunkedName[i][x], chunkedValue[i][x])
            };
            embeds.push(embed);
        }

        bot.util.pages(message, embeds);
    }
}