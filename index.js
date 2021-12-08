require("dotenv").config({ path: '.env' });
const { Client, Collection, MessageEmbed, Intents } = require("discord.js");
const { readdirSync } = require("fs");
const { connect, connection } = require("mongoose");
const autoIncrement = require("mongoose-sequence");

const intents = new Intents(["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES", "GUILD_EMOJIS_AND_STICKERS", "GUILD_BANS", "GUILD_PRESENCES"]);

const bot = new Client({
    intents: intents,
    allowedMentions: { parse: ["users", "roles"], repliedUser: false }
});

connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .catch(err => {
        console.log(`[DATABASE] Connection Error: ${err.stack}`);
    })

autoIncrement(connection);

connection.on("open", () => {
    console.log(`[DATABASE] Connected to MongoDB.`);
})

connection.on("error", (err) => {
    console.log(`[DATABASE] Error: ${err.stack}`);
})

const utils = require("./utils/util");
bot.util = new utils.Utils(bot, process.cwd());

module.exports = { bot };

const { Database } = require("quick.replit");
const db = new Database(process.env.REPLIT_DB_URL);
bot.db = db;

const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const cors = require("cors")
app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const listener = app.listen(process.env.PORT, function () {
    console.log("Listening on port " + listener.address().port)
});

app.get("/", (req, res) => {
    let guilds = bot.guilds.cache.size;
    let obj = {
        data: {
            guilds: guilds
        }
    };
    console.log(Date.now() + " ping received.");
    res.status(200).send(obj);
});

bot.active = new Collection();
bot.cooldowns = new Collection();
bot.commands = new Collection();
bot.aliases = new Collection();
bot.categories = readdirSync("./commands/");
bot.config = require("./config.json");
bot.rbx = require("noblox.js");
bot.logger = require("./utils/logger");

["command", "event"].forEach(handler => {
    require(`./handlers/${handler}`)(bot);
});

GuildMember.prototype.hasPermission = function (permission) {
    return this.permissions.has(permission);
}

Message.prototype.delete = function (options={}) {
	if (typeof options !== 'object') return Promise.reject(new TypeError('INVALID_TYPE', 'options', 'object', true));
    const { timeout = 0 } = options;
    if (timeout <= 0) {
      return this.channel.messages.delete(this.id).then(() => this);
    } else {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.delete());
        }, timeout);
      });
    }
}

bot.login(process.env.TOKEN);