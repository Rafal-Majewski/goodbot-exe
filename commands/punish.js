module.exports={
	triggers: [
		["punish"],
		["ukaż"],
	],
	func: async(data)=>{
		let lang=languageManager(data);
		let member=data.member;
		let server=data.server;
		let message=data.message;
		let parameters=data.parameters;
		if (!parameters[0]) return message.reply(lang.get("userNotProvided"));
		let targetMemberId=extractUserId(parameters[0]);
		let memberDoc=await getMemberDoc(member);
		let targetMemberDoc=await MemberDb.findOne({"_id": targetMemberId}).then(async(memberDoc)=>{
			if (!memberDoc) return message.reply(lang.get("memberFromIdNotFound", {targetMemberId}));
			return memberDoc;
		}).catch((error)=>{throw error;});
		let personelRoleIndex=server.personelRoles.findIndex((role)=>(memberDoc.rolesIds.includes(role.id)));
		if (personelRoleIndex == -1) {
			console.log("GoodGamers.exe: Punish error.");
			return message.reply(lang.get("error"));
		}
		let targetPersonelRoleIndex=server.personelRoles.findIndex((role)=>(targetMemberDoc.rolesIds.includes(role.id)));
		if (targetPersonelRoleIndex == -1) targetPersonelRoleIndex=server.personelRoles.length;
		let targetPersonelRole=data.server.personelRoles[targetPersonelRoleIndex];
		let targetNewPersonelRoleIndex=targetPersonelRoleIndex+1;
		let targetNewPersonelRole=server.personelRoles[targetNewPersonelRoleIndex];
		console.log(targetPersonelRoleIndex, personelRoleIndex);
		if (targetPersonelRoleIndex-personelRoleIndex < 1) return message.reply(lang.get("commands.punish.youCannot"));
		if (targetMemberDoc.annoying) return message.reply(lang.get("commands.punish.alreadyPunished"));
		if (targetPersonelRole) {
			targetMemberDoc.rolesIds=targetMemberDoc.rolesIds.filter((roleId)=>(roleId != targetPersonelRole.id));
			if (targetNewPersonelRole) targetMemberDoc.rolesIds.push(targetNewPersonelRole.id);
		} else {
			if (parameters[1] == undefined) return data.message.reply(lang.get("commands.punish.noDuration"));
			if (isNaN(parameters[1])) return data.message.reply(lang.get("commands.punish.noDuration", {duration: parameters[1]}));
			let durationHours=Number(parameters[1]);
			targetMemberDoc.annoying=Date.now()+durationHours*3600000;
			targetMemberDoc.rolesIds=targetMemberDoc.rolesIds.filter((roleId)=>(roleId != data.server.userRole.id));
			targetMemberDoc.rolesIds.push(server.annoyingUserRole.id);
		}
		targetMemberDoc.save().then(async()=>{
			message.reply(lang.get("commands.punish.success"));
			if (targetMember) data.server.fixMemberRoles(targetMember, targetMemberDoc);
		});
	}
};