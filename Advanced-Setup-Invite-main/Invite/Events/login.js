const client = global.client;
const cfg = require("../Configs/config.json");
const SetupDatabase = require("../Models/Setup")

module.exports = async () => {
  
  const res = await SetupDatabase.findOne({})
  let guildID = res && res.guildID ? res.guildID : ""
  if (guildID === "") return
  const invites = await client.guilds.cache.get(guildID).fetchInvites();
  client.invites.set(guildID, invites);
  console.log(`Sunucu davetleri tanımlandı!`)
  console.log(`(${client.user.username}) adlı hesapta [${client.guilds.cache.get(guildID).name}] adlı sunucuda giriş yapıldı. ✔`)

}

module.exports.conf = {
  name: "ready",
};