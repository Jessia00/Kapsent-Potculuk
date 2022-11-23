const client = global.client;
const inviterSchema = require("../Models/inviter");
const inviteMemberSchema = require("../Models/inviteMember");
const cfg = require("../Configs/config.json");
const SetupDatabase = require("../Models/Setup.js")

module.exports = async (member) => {
  
   const res = await SetupDatabase.findOne({guildID: member.guild.id})
   let inviteLog = res && res.inviteLog ? res.inviteLog : ""
   if (member.user.bot) return;
   const inviteMemberData = await inviteMemberSchema.findOne({ guildID: member.guild.id, userID: member.user.id });
   if (!inviteMemberData) {
    if (client.channels.cache.get(inviteLog)) client.channels.cache.get(inviteLog).send(`📤 **${member.user.tag.replace("`","")}** üyesi sunucudan ayrıldı. Kullanıcıyı davet eden üyeyi bulamadım..`);
  } else {
   const inviter = await client.users.fetch(inviteMemberData.inviter);
   let kullanıcı = member.guild.member(member.guild.members.cache.get(inviter.id))
   await inviterSchema.findOneAndUpdate({ guildID: member.guild.id, userID: inviter.id }, { $inc: { total: -1 } }, { upsert: true });
   const inviterData = await inviterSchema.findOne({ guildID: member.guild.id, userID: inviter.id, });
   const total = inviterData ? inviterData.total : 0;
   if (client.channels.cache.get(inviteLog)) client.channels.cache.get(inviteLog).send(`📤 **${member.user.tag.replace("`","")}** üyesi sunucudan ayrıldı. Davet eden üye ${inviter} (**${total === -1 ? 0 : total}** adet daveti var)`); }

}

module.exports.conf = {
  name: "guildMemberRemove",
};