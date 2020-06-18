module.exports={
	triggers: [
		["derank"],
	],
	func: async(data)=>{
		let lang=languageManager(data);
		let member=data.member;
		let server=data.server;
		let message=data.message;
		let parameters=data.parameters;
		if (!parameters[0]) return message.reply(lang.get("userNotProvided"));
		let targetMemberId=extractUserId(parameters[0]);
		data.guild.members.fetch(targetMemberId).then(async(targetMember)=>{
			let memberDoc=await getMemberDoc(member);
			let targetMemberDoc=await getMemberDoc(targetMember);
			let personelRoleIndex=server.personelRoles.findIndex((role)=>(memberDoc.rolesIds.includes(role.id)));
			if (personelRoleIndex == -1) {
				console.log("GoodGamers.exe: Derank error.");
				return message.reply(lang.get("error"));
			}
			let targetPersonelRoleIndex=server.personelRoles.findIndex((role)=>(targetMemberDoc.rolesIds.includes(role.id)));
			if (targetPersonelRoleIndex == -1) return message.reply(lang.get("commands.derank.cannotMore"));
			if (personelRoleIndex >= targetPersonelRoleIndex) return message.reply(lang.get("commands.derank.youCannot"));
			let targetNewPersonelRoleIndex=targetPersonelRoleIndex+1;
			let targetNewPersonelRole=server.personelRoles[targetNewPersonelRoleIndex];
			let targetPersonelRole=server.personelRoles[targetPersonelRoleIndex];
			targetMemberDoc.rolesIds=targetMemberDoc.rolesIds.filter((roleId)=>(roleId != targetPersonelRole.id));
			if (targetNewPersonelRole) targetMemberDoc.rolesIds.push(targetNewPersonelRole.id);
			await targetMemberDoc.save().then(async()=>{
				message.reply(lang.get("commands.derank.success"));
				await server.fixMemberRoles(targetMember, targetMemberDoc);
			});
		}).catch((error)=>{
			console.error(error);
			message.reply(lang.get("memberFromIdNotFound", {targetMemberId}));
		});
	}
};