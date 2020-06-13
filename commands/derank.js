module.exports={
	triggers: [
		["derank"],
	],
	func: async(data)=>{
		let lang=languageManager(data);
		let server=data.server;
		if (data.member.roles.cache.has(data.server.ownerRole.id)) {
			if (!data.parameters[0]) return data.message.reply(`User not provided`);
			let memberId=(data.parameters[0].startsWith("<@!"))?(data.parameters[0].slice(3, -1)):((data.parameters[0].startsWith("<@"))?(data.parameters[0].slice(2, -1)):(data.parameters[0]));
			data.guild.members.fetch(memberId).then(async(member)=>{
				let oldPersonelRoleIndex=data.server.personelRoles.findIndex((role)=>(member.roles.cache.has(role.id)));
				if (oldPersonelRoleIndex == -1) return data.message.reply("The user cannot be deranked more.");
				let newPersonelRoleIndex=oldPersonelRoleIndex+1;
				getMemberDoc(member).then(async(memberDoc)=>{
					memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != data.server.personelRoles[oldPersonelRoleIndex].id));
					if (newPersonelRoleIndex != data.server.personelRoles.length) memberDoc.rolesIds.push(data.server.personelRoles[newPersonelRoleIndex].id);
					memberDoc.save().then(async()=>{
						data.message.reply("deranked");
						data.server.fixMemberRoles(member, memberDoc);
					});
					
				});
			}).catch((error)=>{
				//console.error(error);
				data.message.reply(`Member with id ${memberId} was not found.`);
			});
		}
		else data.message.reply("Missing permissions");
	}
};