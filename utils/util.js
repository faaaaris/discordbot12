const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const moment = require("moment");
const rbx = require("noblox.js");
const fetch = require("node-fetch");
require("moment-duration-format");

const baseURL = `https://ping-app123.herokuapp.com/api/`

module.exports.Utils = class Utils {

	constructor(bot, project_folder) {
		this.bot = bot;
		this.project_folder = project_folder;
	}

	async updateCaseId(db) {
		let current = await db.get("currentCaseId") || 0;
		db.set("currentCaseId", current + 1);
	}

	escapeRegex(string) {
		return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	setRank(groupId, userId, rankId) {
		return new Promise((resolve, reject) => {
			return fetch(`${baseURL}setrank/${process.env.API_KEY}/${groupId}/${userId}/${rankId}`)
				.then(async res => {
					const data = await res.json();
					console.log(data);

					if (res.status === 200 && !data.err) {
						let role = rbx.getRole(Number(groupId), rankId);
						resolve(role);
					} else {
						reject(new Error(`${res.status} ${data.message}`));
					}
				})
		})
	}

	promote(groupId, userId) {
		return new Promise((resolve, reject) => {
			return fetch(`${baseURL}${process.env.API_KEY}/${groupId}/${userId}`)
				.then(async res => {
					const data = await res.json();

					if (res.status === 200 && !data.err) {
						resolve(data.data);
					} else {
						reject(new Error(`${res.status} ${data.message}`));
					}
				})
		})
	}

	demote(groupId, userId) {
		return new Promise((resolve, reject) => {
			return fetch(`${baseURL}${process.env.API_KEY}/${groupId}/${userId}`)
				.then(async res => {
					const data = await res.json();

					if (res.status === 200 && !data.err) {
						resolve(data.data);
					} else {
						reject(new Error(`${res.status} ${data.message}`));
					}
				})
		})
	}

	timeConversion(duration) {
		const portions = [];

		const msInHour = 1000 * 60 * 60;
		const hours = Math.trunc(duration / msInHour);
		if (hours > 0) {
			portions.push(hours + 'h');
			duration = duration - (hours * msInHour);
		}

		const msInMinute = 1000 * 60;
		const minutes = Math.trunc(duration / msInMinute);
		if (minutes > 0) {
			portions.push(minutes + 'm');
			duration = duration - (minutes * msInMinute);
		}

		const seconds = Math.trunc(duration / 1000);
		if (seconds > 0) {
			portions.push(seconds + 's');
		}

		return portions.join(' ');
	}

	makeid(length) {
		let result = "";
		let characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	resolveMember(message, toFind = "") {
		toFind = toFind.toLowerCase();

		let target = message.guild.members.cache.get(toFind);

		if (!target && message.mentions.members) {
			target = message.mentions.members.first();
		}

		if (!target && toFind) {
			target = message.guild.members.cache.find(member => {
				return (
					member.user.username.toLowerCase().includes(toFind) ||
					member.user.tag.toLowerCase().includes(toFind)
				)
			});
		}

		if (!target) return null;

		return target;
	}

	resolveChannel(message, toFind = "") {
		toFind = toFind.toLowerCase();

		let target = message.guild.channels.cache.get(toFind);

		if (!target && message.mentions.channels) {
			target = message.mentions.channels.first();
		}

		if (!target && toFind) {
			target = message.guild.channels.cache.find(channel => {
				return (
					channel.name.toLowerCase().includes(toFind)
				)
			});
		}

		if (!target) return null;

		return target;
	}

	resolveRole(message, toFind = "") {
		toFind = toFind.toLowerCase();

		let target = message.guild.roles.cache.get(toFind);

		if (!target && message.mentions.roles) {
			target = message.mentions.roles.first();
		}

		if (!target && toFind) {
			target = message.guild.roles.cache.find(role => {
				return (
					role.name.toLowerCase().includes(toFind)
				)
			});
		}

		if (!target) return null;

		return target;
	}

	timeDifference(current, previous) {
		current = moment(new Date(current));
		previous = moment(new Date(previous));

		let years = previous.diff(current, "years") === 0 ? "" : previous.diff(current, "years") === 1 ? `${previous.diff(current, "years")} year` : `${previous.diff(current, "years")} years`;
		let months = previous.diff(current, "months") === 0 ? "" : previous.diff(current, "months") === 1 ? `${previous.diff(current, "months")} month` : `${previous.diff(current, "months")} months`;
		let days = previous.diff(current, "days") === 0 ? "" : previous.diff(current, "days") === 1 ? `${previous.diff(current, "days")} day` : `${previous.diff(current, "days")} days`;
		let hours = previous.diff(current, "hours") === 0 ? "" : previous.diff(current, "hours") === 1 ? `${previous.diff(current, "hours")} hour` : `${previous.diff(current, "hours")} hours`;
		let minutes = previous.diff(current, "minutes") === 0 ? "" : previous.diff(current, "minutes") + " min";
		let seconds = previous.diff(current, "seconds") === 0 ? "" : previous.diff(current, "seconds") + " sec";

		return years + months + days + hours + minutes + seconds;
	}

	trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`and ${len} more...`);
		}
		return arr;
	}

	checkURL(url) {
		const validUrl = require("valid-url");
		if (validUrl.isUri(url)) {
			let noparams = url.split("?")[0];
			return (noparams.match(/\.(jpeg|jpg|gif|png)$/) != null);
		} else return false;
	}

	async pages(message, content, options = {
		time: 100000,
		startPage: 0,
	}) {
		if (!(content instanceof Array)) throw new TypeError("Content is not an array.");
		if (!content.length) throw new Error("Content array is empty.");

		const time = options.time;

		if (message instanceof Discord.Message) {
			if (content.length === 1) {
				content[0].footer.text = content[0].footer.text
					.replace("{{current}}", 1)
					.replace("{{total}}", 1);

				await message.reply({ embeds: [content[0]] });
				return;
			}

			const filter = i => {
				return [`next_${message.id}`, `back_${message.id}`].includes(i.customId) && i.user.id === message.author.id;
			}

			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId(`back_${message.id}`)
						.setStyle("PRIMARY")
						.setLabel("Back")
						.setEmoji("⬅️"),

					new Discord.MessageButton()
						.setCustomId(`next_${message.id}`)
						.setStyle("PRIMARY")
						.setLabel("Next")
						.setEmoji("➡️")
				)

			let page = options.startPage;
			content[page].footer.text = content[page].footer.text
				.replace("{{current}}", page + 1)
				.replace("{{total}}", content.length.toString());
			const msg = await message.reply({ embeds: [content[page]], components: [row] });

			const collector = message.channel.createMessageComponentCollector({ filter, time: time });
			collector.on("collect", async i => {
				if (i.customId === `back_${message.id}`) {
					page = page > 0 ? page - 1 : content.length - 1;
				}
				else if (i.customId === `next_${message.id}`) {
					page = page + 1 < content.length ? page + 1 : 0;
				}

				if (msg) {
					content[page].footer.text = content[page].footer.text
						.replace("{{current}}", page + 1)
						.replace("{{total}}", content.length.toString());
					await i.update({ embeds: [content[page]], components: [row] });
				}
			});

			collector.on("end", async () => {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				if (msg) await msg.edit({ embeds: [content[page]], components: [row] });
			})
		} else if (message instanceof Discord.Interaction) {
			if (content.length === 1) {
				content[0].footer.text = content[0].footer.text
					.replace("{{current}}", 1)
					.replace("{{total}}", 1);

				await message.followUp({ embeds: [content[0]] });
				return;
			}

			const filter = i => {
				return [`next_${message.id}`, `back_${message.id}`].includes(i.customId) && i.user.id === message.user.id;
			}

			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId(`back_${message.id}`)
						.setStyle("PRIMARY")
						.setLabel("Back")
						.setEmoji("⬅️"),

					new Discord.MessageButton()
						.setCustomId(`next_${message.id}`)
						.setStyle("PRIMARY")
						.setLabel("Next")
						.setEmoji("➡️")
				)

			let page = options.startPage;
			content[page].footer.text = content[page].footer.text
				.replace("{{current}}", page + 1)
				.replace("{{total}}", content.length.toString());
			const msg = await message.followUp({ embeds: [content[page]], components: [row] });

			const collector = message.channel.createMessageComponentCollector({ filter, time: time });
			collector.on("collect", async i => {
				if (i.customId === `back_${message.id}`) {
					page = page > 0 ? page - 1 : content.length - 1;
				}
				else if (i.customId === `next_${message.id}`) {
					page = page + 1 < content.length ? page + 1 : 0;
				}

				if (msg) {
					content[page].footer.text = content[page].footer.text
						.replace("{{current}}", page + 1)
						.replace("{{total}}", content.length.toString());
					await i.update({ embeds: [content[page]], components: [row] });
				}
			});

			collector.on("end", async () => {
				row.components[0].setDisabled(true);
				row.components[1].setDisabled(true);
				if (msg) await msg.edit({ embeds: [content[page]], components: [row] });
			})
		}
	}

	_findNested(dir, pattern) {

		let results = [];

		fs.readdirSync(dir).forEach(inner_dir => {

			inner_dir = path.resolve(dir, inner_dir);
			const stat = fs.statSync(inner_dir);

			if (stat.isDirectory()) {
				results = results.concat(this._findNested(inner_dir, pattern));
			}

			if (stat.isFile() && inner_dir.endsWith(pattern)) {
				results.push(inner_dir);
			}

		});

		return results;

	}

	loadModules(dir, command = false) {

		const jsFiles = this._findNested(this.project_folder + dir, ".js");

		if (!command) {

			if (jsFiles.length <= 0) return console.log(`There are no files to load.`);

			console.log(`Loading ${jsFiles.length} file${jsFiles.length <= 1 ? "" : "s"}...`);
			jsFiles.forEach(file => {
				require(file);
			});

		} else {

			if (jsFiles.length <= 0) return console.log("There are no commands to load.");

			console.log(`Loading ${jsFiles.length} command file${jsFiles.length <= 1 ? "" : "s"}...`);
			jsFiles.forEach(file => {
				const cmd = require(file);
				this.bot.commands.set(cmd.name, cmd);

				cmd.aliases.forEach(alias => {
					this.bot.aliases.set(alias, cmd.name);
				});

			});
		}

	}

	loadCommand(command, autoReload = true) {

		if (!autoReload) {
			const commandFiles = this._findNested(this.project_folder + "/commands/", ".js");
			command = commandFiles.filter(commandFile => commandFile.split("/").pop() == `${command}.js`)[0];
			if (!command) return "Unknown Command";
		}

		try {

			const cmd = require(command);
			if (this.bot.commands.get(cmd.name)) return "Command Already Loaded";

			this.bot.commands.set(cmd.name, cmd);
			cmd.aliases.forEach(alias => {
				this.bot.aliases.set(alias, cmd.name);
			});
			return "Command Loaded";

		} catch (err) {
			console.log(err)
			return "Error";
		}

	}

	unloadCOmmand(command, autoReload = true) {

		if (!autoReload) {
			const commandFiles = this._findNested(this.project_folder + "/commands/", ".js");
			command = commandFiles.filter(commandFile => commandFile.split("/").pop() == `${command}.js`)[0];
			if (!command) return "Unknown Command";
		}

		try {
			const commandName = command.split("/").pop().split(".")[0];
			const res = this.bot.commands.delete(commandName);
			if (!res) return "Command Not Loaded";

			delete require.cache[require.resolve(command)];
			return "Command Unloaded";

		} catch (err) {
			console.log(err)
			return "Error";
		}

	}

	reloadCommand(commandName) {

		const commandFiles = this._findNested(this.project_folder + "/commands/", ".js");
		const command = commandFiles.filter(commandFile => commandFile.split("/").pop() == `${commandName}.js`)[0];
		if (!command) return "Unknown Command";

		const res = this.unloadCOmmand(command);

		switch (res) {
			case "Command Unloaded": return this.loadCommand(command);
			default: return res;
		}

	}
}