const client = global.client;
const { Collection, MessageEmbed } = require("discord.js");
const inviterSchema = require("../Models/inviter");
const inviteMemberSchema = require("../Models/inviteMember");
const cfg = require("../Configs/config.json");
const humanizeDuration = require("humanize-duration")
const moment = require("moment");
require("moment-duration-format");
const Puan = require("../Models/Puan");
const coinDatabase = require("../Models/Coin");
const görevDatabase = require("../Models/Görev");
const SetupDatabase = require("../Models/Setup.js")
const ControlsDatabase = require("../Models/Controls");

module.exports = async (member) => {
  
   const res = await SetupDatabase.findOne({guildID: member.guild.id})
   const doc = await ControlsDatabase.findOne({guildID: member.guild.id})
   let inviteLog = res && res.inviteLog ? res.inviteLog : ""
   let newAccLog = res && res.newAccLog ? res.newAccLog : ""
   let newAccRole = res && res.newAccRole ? res.newAccRole : ""
   let taglıAlım = doc && doc.taglıalım ? doc.taglıalım : "Kapalı"
   let rules = res && res.rules ? `<#`+res.rules+`>` : "kurallar"
   let registerChat = res && res.registerChat ? res.registerChat : ""
   let guildName = res && res.welcomeMessageGuildName ? res.welcomeMessageGuildName : "Sunucuya"
   let registerVoiceName = res && res.RegisterVoiceName ? res.RegisterVoiceName : "Ses"
   let otoTag = res && res.otoTag ? res.otoTag : `${member.user.username.replace(/([^a-z0-9 ]+)/gi, '')}`
   let guildTag = res && res.guildTag ? ` (${res.guildTag})` : "" 
   let unregisterRoles = res && res.unregisterRoles ? res.unregisterRoles : []  
   let durum = res && res.autoPerm === true ? res.autoPerm : res.autoPerm === false ? res.autoPerm : ""
   let noAutoPerm = res && res.noAutoPerm ? res.noAutoPerm : [] 
   let invitePuan = res && res.invitePuan ? res.invitePuan : 7.5
   let inviteCoin = res && res.inviteCoin ? res.inviteCoin : 7.5  
   let staffRoles = res && res.staffRoles ? res.staffRoles : [] 
   let yetkiUpLog = res && res.yetkiUpLog ? res.yetkiUpLog : ""
   
   if (member.user.bot) return;
   const gi = client.invites.get(member.guild.id).clone() || new Collection().clone();
   const invites = await member.guild.fetchInvites();
   const invite = invites.find((x) => gi.has(x.code) && gi.get(x.code).uses < x.uses) || gi.find((x) => !invites.has(x.code)) || member.guild.vanityURLCode;
   client.invites.set(member.guild.id, invites);
  
   await member.roles.set(unregisterRoles).catch(() => { }) 
   await member.setNickname(otoTag).catch(() => { })
  
   let emoji = ""
   if (Date.now() - member.user.createdTimestamp <= 1000 * 60 * 60 * 24 * 7) {
    emoji = cfg.Emoji.RedEmoji  
   } else emoji = cfg.Emoji.TickEmoji
  
   if (client.channels.cache.get(registerChat)) client.channels.cache.get(registerChat).send(`${guildName} Hoş geldin ${member} Biz de seni bekliyorduk! Hesabın **${moment(member.user.createdAt).locale("TR").format("LLL")}** tarihinde oluşturulmuş! ${emoji}\n\nSunucu odalarını görebilmek için "${registerVoiceName}" odalarında yetkililerimize isim yaş belirtmelisin.\nUnutma ki ${rules} toplumun düzenini sağlamak için var. Kurallarımıza göz atmayı ihmal etme!${taglıAlım === "Açık" ? `\n\nSunucumuz şu anlık yalnızca taglı${guildTag} üyelerimize açıktır. Tagımıza ulaşmak için herhangi bir kanala !tag yazabilirsiniz.` : ``}\n\nSeninle beraber ${member.guild.memberCount} kişiye ulaştık! 🎉`)
   
   if (invite === member.guild.vanityURLCode) {
    if (client.channels.cache.get(inviteLog)) client.channels.cache.get(inviteLog).send(`${member} Özel URL kullandı.`)
   return} 
  
   if (!invite.inviter) {
    if (client.channels.cache.get(inviteLog)) client.channels.cache.get(inviteLog).send(`${member} kullanıcısının nereden geldiğini bulamadım..`);
   return}
  
   if (Date.now() - member.user.createdTimestamp <= 1000 * 60 * 60 * 24 * 7) {
    await inviteMemberSchema.findOneAndUpdate({ guildID: member.guild.id, userID: member.user.id }, { $set: { inviter: invite.inviter.id, date: Date.parse(new Date().toLocaleString("tr-TR", { timeZone: "Asia/Istanbul" })) } }, { upsert: true });
    await inviterSchema.findOneAndUpdate({ guildID: member.guild.id, userID: invite.inviter.id }, { $inc: { total: 1, fake: 1 } }, { upsert: true });
    const inviterData = await inviterSchema.findOne({ guildID: member.guild.id, userID: invite.inviter.id });
    const total = inviterData ? inviterData.total : 0;
    const vegas1 = inviterData ? inviterData.regular : 0;
    const bonus = inviterData ? inviterData.bonus : 0;
    const leave = inviterData ? inviterData.leave : 0;
    const fake = inviterData ? inviterData.fake : 0;
    const regular = vegas1 - leave - fake
    await member.roles.set([newAccRole]).catch(() => { })
    if (client.channels.cache.get(newAccLog)) client.channels.cache.get(newAccLog).send(new MessageEmbed().setColor("RANDOM").setAuthor(member.user.tag, member.user.avatarURL({dynamic:true})).setDescription(`${member} üyesi sunucuya katıldı fakat hesabı **7** günden önce açıldığı için jaile atıldı!`).addField(`**Hesap Bilgi:**`, `\`⦁\` Profil: ${member} (\`${member.user.tag}\` - \`${member.id}\`)\n\`⦁\` Kuruluş Tarihi: ${moment(member.user.createdAt).locale("TR").format("LLL")} (\`${moment(member.user.createdAt).locale("TR").fromNow()}\`)\n`).addField(`**Davet Bilgi:**`, `\`⦁\` Davet Eden: ${invite === member.guild.vanityURLCode ? `Özel URL ${member.guild.fetchVanityData().then(res =>  `(${member.guild.vanityURLCode}: \`${res.uses}\` kullanım.)`)}` : `${invite.inviter} (\`${invite.inviter.tag}\` - \`${invite.inviter.id}\`)\n\`⦁\` Davet Sayısı: Toplamda **${total}** daveti var. (**${regular > 0 ? regular : 0}** regular, **${bonus}** bonus, **${fake}** fake, **${leave}** ayrılan)`}`))
    if (client.channels.cache.get(inviteLog)) client.channels.cache.get(inviteLog).send(`📥 ${member} üyesi sunucuya katıldı. Davet eden üye ${invite.inviter} (**${total}** adet daveti var)`);
   } else {
    await inviterSchema.findOneAndUpdate({ guildID: member.guild.id, userID: invite.inviter.id }, { $inc: { total: 1, regular: 1 } }, { upsert: true });
    const inviterData = await inviterSchema.findOne({ guildID: member.guild.id, userID: invite.inviter.id });
    let kullanıcı = member.guild.member(member.guild.members.cache.get(invite.inviter.id))
    if (durum === true) {
    if (!noAutoPerm.some(x => kullanıcı.roles.cache.has(x))) {
    if (staffRoles.some(x => kullanıcı.roles.cache.has(x))) {
    const res = await görevDatabase.findOne({guildID: kullanıcı.guild.id, userID: kullanıcı.id});
    if(res) {
    await görevDatabase.findOneAndUpdate({guildID: kullanıcı.guild.id, userID: kullanıcı.id}, {$inc: {InviteCount: 1}}, {upsert: true})  
    const res = await görevDatabase.findOne({guildID: kullanıcı.guild.id, userID: kullanıcı.id}); 
    let görev = res.Invite.map((q) => q.Count)
    let count = res && res.InviteCount ? res.InviteCount : 0
    if(count >= görev) {
    if(res.InviteDurum === "Ödül Alındı!") {}else{
    if(res.InviteDurum === "Tamamlandı!") {}else{
    await görevDatabase.findOneAndUpdate({guildID: kullanıcı.guild.id, userID: kullanıcı.id}, {$set: {InviteDurum: "Tamamlandı!"}}, {upsert: true})    
    }}}}
    await Puan.findOneAndUpdate({ guildID: kullanıcı.guild.id, userID: kullanıcı.id }, { $inc: { puan: cfg.Puan.invitePuan} }, { upsert: true });
    await coinDatabase.findOneAndUpdate({ guildID: kullanıcı.guild.id, userID: kullanıcı.id }, { $inc: { coinMonth: cfg.Puan.inviteCoin, coinWeek: cfg.Puan.inviteCoin, coinDaily: cfg.Puan.inviteCoin, Coin: cfg.Puan.inviteCoin} }, { upsert: true });
    const puanData = await Puan.findOne({ guildID: kullanıcı.guild.id, userID: kullanıcı.id });
    if (puanData && client.puanData.some(x => puanData.puan === x.puan)) {
    let newRank = client.puanData.filter(x => puanData.puan >= x.puan);
     newRank = newRank[newRank.length-1];
    const oldRank = client.puanData[client.puanData.indexOf(newRank)-1];
     kullanıcı.roles.add(newRank.role);
    const maxValue = client.puanData[client.puanData.indexOf(client.puanData.find(x => x.puan >= (puanData ? puanData.puan : 0)))] || client.puanData[client.puanData.length-1];
    const maxValue2 = client.puanData[client.puanData.indexOf(maxValue)-2]   
    if (oldRank && Array.isArray(oldRank.role) && oldRank.role.some(x => kullanıcı.roles.cache.has(x)) || oldRank && !Array.isArray(oldRank.role) && kullanıcı.roles.cache.has(oldRank.role)) kullanıcı.roles.remove(oldRank.role);
    try{ if (client.channels.cache.get(yetkiUpLog)) client.channels.cache.get(yetkiUpLog).send(`🎉 ${kullanıcı} tebrikler! Puan sayın bir sonraki yetkiye geçmen için yeterli oldu. \`${kullanıcı.guild.roles.cache.get(maxValue2.role).name}\` yetkisinden ${Array.isArray(newRank.role) ? newRank.role.map(x => `\`${kullanıcı.guild.roles.cache.get(x).name}\``).join(", ") : `\`${kullanıcı.guild.roles.cache.get(newRank.role).name}\``} yetkisine terfi edildin!`);
    }catch{ if (client.channels.cache.get(yetkiUpLog)) client.channels.cache.get(yetkiUpLog).send(`🎉 ${kullanıcı} tebrikler! Puan sayın bir sonraki yetkiye geçmen için yeterli oldu. ${Array.isArray(newRank.role) ? newRank.role.map(x => `\`${kullanıcı.guild.roles.cache.get(x).name}\``).join(", ") : `\`${kullanıcı.guild.roles.cache.get(newRank.role).name}\``} yetkisine terfi edildin!`);}}}}}      
    const total = inviterData ? inviterData.total : 0;
    if (invite.inviter.id === member.id) {
    await inviterSchema.findOneAndUpdate({ guildID: member.guild.id, userID: invite.inviter.id}, { $inc: { total: -1, regular: -1 } }, { upsert: true })
    if (cfg.Staff.StaffRoles.some(x => kullanıcı.roles.cache.has(x))) {
    await Puan.findOneAndUpdate({ guildID: member.guild.id, userID: invite.inviter.id }, { $inc: { puan: -cfg.Puan.invitePuan } }, { upsert: true });
    await coinDatabase.findOneAndUpdate({ guildID: kullanıcı.guild.id, userID: kullanıcı.id }, { $inc: { coinMonth: -cfg.Puan.inviteCoin, coinWeek: -cfg.Puan.inviteCoin, coinDaily: -cfg.Puan.inviteCoin, Coin: -cfg.Puan.inviteCoin} }, { upsert: true });
    }
    if (client.channels.cache.get(inviteLog)) client.channels.cache.get(inviteLog).send(`📥 ${member} üyesi sunucuya katıldı, kullanıcı kendi kendini davet ettiği için işlem yapılmadı.`)
   } else {
    await inviteMemberSchema.findOneAndUpdate({ guildID: member.guild.id, userID: member.user.id }, { $set: { inviter: invite.inviter.id, date: Date.now() } }, { upsert: true });
    if (client.channels.cache.get(inviteLog)) client.channels.cache.get(inviteLog).send(`📥 ${member} üyesi sunucuya katıldı. Davet eden üye ${invite.inviter} (**${total}** adet daveti var)`);}
   }}

module.exports.conf = {
  name: "guildMemberAdd",
};