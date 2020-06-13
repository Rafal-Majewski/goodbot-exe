module.exports={
	triggers: [
		["punish"],
		["ukaż"],
	],
	func: async(data)=>{
		let lang=languageManager(data);
		let server=data.server;
		if (data.member.roles.cache.has(data.server.administratorRole.id) || data.member.roles.cache.has(data.server.ownerRole.id)) {
			if (!data.parameters[0]) return data.message.reply("User not provided");
			let memberId=(data.parameters[0].startsWith("<@!"))?(data.parameters[0].slice(3, -1)):((data.parameters[0].startsWith("<@"))?(data.parameters[0].slice(2, -1)):(data.parameters[0]));
			data.guild.members.fetch(memberId).then(async(member)=>{
				let personelRoleIndex=data.server.personelRoles.findIndex((role)=>(member.roles.cache.has(role.id)));
				getMemberDoc(member).then((memberDoc)=>{
					if (personelRoleIndex == -1) {
						if (data.parameters[1] == undefined) return data.message.reply(`You need to provide a duration.`);
						if (isNaN(data.parameters[1])) return data.message.reply(`${data.parameters[1]} is not a valid number.`);
						let durationMinutes=Number(data.parameters[1]);
						memberDoc.annoying=Date.now()+durationMinutes*3600000;
						memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != data.server.userRole.id));
						memberDoc.rolesIds.push(data.server.annoyingUserRole.id);
					} else {
						memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != data.server.personelRoles[personelRoleIndex].id));
						if (personelRoleIndex+1 < data.server.personelRoles.length) memberDoc.rolesIds.push(data.server.personelRoles[personelRoleIndex+1].id);
					}
					memberDoc.save().then(async()=>{
						data.message.reply("punished");
						data.server.fixMemberRoles(member, memberDoc);
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