const { Client, Collection } = require("discord.js");
const client = (global.client = new Client({ fetchAllMembers: true }));
const cfg = require("./Invite/Configs/config.json");
const moment = require("moment");
const SetupDatabase = require("./Invite/Models/Setup")

client.commands = global.commands = new Collection();
client.aliases = new Collection();
client.invites = new Collection();
client.cooldown = new Map();
require("./Invite/Handlers/commandHandler");
require("./Invite/Handlers/eventHandler");
require("./Invite/Handlers/mongoHandler");
require("./Invite/Events/functions.js")(client, cfg, moment); 

client.login(cfg.Bot.Token).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));

setInterval(async() => {
 const res = await SetupDatabase.findOne({})
 let guildID = res && res.guildID ? res.guildID : ""
 const doc = await SetupDatabase.findOne({guildID: guildID})
 let array = doc && doc.autoAuthorizationRoles ? doc.autoAuthorizationRoles : []
 client.puanData = doc && doc.autoAuthorizationRoles ? doc.autoAuthorizationRoles.sort((a, b) => a.puan - b.puan) : []
}, 1000)