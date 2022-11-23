module.exports = {
  conf: {
    aliases: ["invtop", "invite-top", "davet-top", "davettop","topdavet","invitetop","topinvite"],
    name: "invitestop",
    usage: 'davettop',
    description: "Sunucuda ki top 10 davet sıralamasını görürsünüz."
  },

  run: async ({client, msg, args, inviterData}) => {
    
    let data = await inviterData.find({ guildID: msg.guild.id }).sort({ total: -1 });
    if (!data.length) return client.message(client.normalEmbed("Veritabanında invite verisi bulunamadı.", msg), msg.channel.id);
    let arr = [];
    data.forEach((x) => arr.push({ id: x.userID, total: x.total }));
    let index = arr.findIndex((x) => x.id == msg.author.id) + 1;
    let list = data
     .filter((x) => msg.guild.members.cache.has(x.userID))
     .splice(0, 20)
     .map((x, index) => `${x.userID === msg.author.id ? `\`${index + 1}.\` <@${x.userID}> Toplam **${x.total}** daveti var. (**${x.regular-x.fake-x.leave < 0 ? 0 : x.regular-x.fake-x.leave}** normal, **${x.fake}** sahte, **${x.leave}** ayrılan, **${x.bonus}** bonus) (**Siz**)` : `\`${index + 1}.\` <@${x.userID}> Toplam **${x.total}** daveti var. (**${x.regular-x.fake-x.leave}** normal, **${x.fake}** sahte, **${x.leave}** ayrılan, **${x.bonus}** bonus)`}`)
     .join("\n");
    const veri = await inviterData.findOne({ guildID: msg.guild.id, userID: msg.author.id });
     client.message(client.normalEmbed(`Top 20 davet sıralaması aşağıda belirtilmiştir.\n\n${list} \n\nSiz **${index}.** sırada bulunuyorsunuz. Toplam **${veri.total}** davetiniz var. (**${veri.regular-veri.fake-veri.leave < 0 ? 0 : veri.regular-veri.fake-veri.leave}** normal, **${veri.fake}** sahte, **${veri.leave}** ayrılan, **${veri.bonus}** bonus)`, msg), msg.channel.id)
     client.react(msg, "tick")}}