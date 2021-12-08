const Discord = require("discord.js");
const config = require("../config.json");

const yesEmoji = config.emojis.yes;
const noEmoji = config.emojis.no;

const error = (message) => {
	let embed = new Discord.MessageEmbed()
		.setColor(config.colors.red)
		.setDescription(`${noEmoji} ${message}`)

	return embed;
}

const err = (message) => {
	let embed = new Discord.MessageEmbed()
		.setColor(config.colors.red)
		.setDescription(`${noEmoji} ${message}`)

	return embed;
}

const success = (message) => {
	let embed = new Discord.MessageEmbed()
		.setColor(config.colors.green)
		.setDescription(`${yesEmoji} ${message}`)

	return embed;
}

const info = (message) => {
	let embed = new Discord.MessageEmbed()
		.setColor(config.colors.blue)
		.setDescription(message)

	return embed;
}

module.exports = {
	error,
	err,
	success,
	info
};