module.exports={
	triggers: [
		["punish"],
		["ukaż"],
	],
	func: async(data)=>{
		let lang=languageManager(data);
		let server=data.server;
		if (data.member.roles.cache.has(data.server.administratorRole.id) || data.member.roles.cache.has(data.server.ownerRole.id)) {
			if (!data.parameters[0]) return data.message.reply(`User not provided`);
			let memberId=(data.parameters[0].startsWith("<@!"))?(data.parameters[0].slice(3, -1)):((data.parameters[0].startsWith("<@"))?(data.parameters[0].slice(2, -1)):(data.parameters[0]));
			data.guild.members.fetch(memberId).then(async(member)=>{
				let personelRoleIndex=data.server.personelRoles.findIndex((role)=>(member.roles.cache.has(role.id)));
				console.log(personelRoleIndex);
				if (personelRoleIndex == -1) {
					let durationMinutes=Number(data.parameters[1]);
					if (durationMinutes == NaN) return data.message.reply(`${data.parameters[1]} is not a valid number.`);
					getMemberDoc(member).then((memberDoc)=>{
						memberDoc.annoying=Date.now()+durationMinutes*3600000;
						memberDoc.save().then(async()=>{
							await member.roles.add(data.server.annoyingUserRole);
							await member.roles.remove(data.server.userRole);
							data.message.reply("punished");
						});
					});
				}
				else {
					await member.roles.remove(data.server.personelRoles[personelRoleIndex]);
					console.log(personelRoleIndex);
					if (personelRoleIndex+1 < data.server.personelRoles.length) await member.roles.add(data.server.personelRoles[personelRoleIndex+1]);
				}
			}).catch((error)=>{
				console.error(error);
				data.message.reply(`Member with id ${memberId} was not found.`);
			});
		}
		else data.message.reply("Missing permissions");
	}
};