module.exports={
	triggers: [
		["pardon"],
		["przepros"],
	],
	func: async(data)=>{
		let lang=languageManager(data);
		let server=data.server;
		if (data.member.roles.cache.has(data.server.administratorRole.id) || data.member.roles.cache.has(data.server.ownerRole.id)) {
			if (!data.parameters[0]) return data.message.reply("User not provided");
			let memberId=(data.parameters[0].startsWith("<@!"))?(data.parameters[0].slice(3, -1)):((data.parameters[0].startsWith("<@"))?(data.parameters[0].slice(2, -1)):(data.parameters[0]));
			data.guild.members.fetch(memberId).then(async(member)=>{
				getMemberDoc(member).then((memberDoc)=>{
					if (!memberDoc.annoying) return data.message.reply("The user is ok");
					memberDoc.annoying=null;
					memberDoc.save().then(()=>{
						data.server.fixMemberRoles(member, memberDoc);
						return data.message.reply("pardoned");
					});
				});
			}).catch((error)=>{
				console.error(error);
				data.message.reply(`Member with id ${memberId} was not found.`);
			});
		}
		else data.message.reply("Missing permissions");
	}
};