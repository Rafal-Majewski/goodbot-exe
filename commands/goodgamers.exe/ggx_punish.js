module.exports={
	triggers: [
		["punish"],
		["ukaż"],
	],
	func: async(data)=>{
		// init a language manager
		let lang=languageManager(data);
		let guildConfig=data.guildConfig;
		let message=data.message;
		let permissionLvl=data.permissionLvl;
		let parameters=data.parameters;
		// check if the invoker provided a target member, if not throw an error
		if (!parameters[0]) return message.reply(lang("userNotProvided"));
		// extract the target member id
		let targetMemberId=removeNonNumericCharacters(parameters[0]);
		// try to fetch the target member
		let targetMember;
		try {
			targetMember=await data.guild.members.fetch(targetMemberId);
		} catch {
			// the target member is not on the guild, throw an error
			return message.reply(lang("memberFromIdNotFound", {targetMemberId}));
		}
		// get target member's doc
		let targetMemberDoc=await getMemberDoc(targetMember);
		
		let targetPermissionLvl=await guildConfig.calculatePermissionLvl(targetMember);
		if (permissionLvl <= targetPermissionLvl) return message.reply(lang("commands.punish.youCannot"));
		
		let targetNewPermissionLvl=targetPermissionLvl-1;
		let targetNewPersonelRole=(Object.values(guildConfig.personelRolesInfo).find((roleInfo)=>(roleInfo.permissionLvl == targetNewPermissionLvl)) || {}).role;
		let targetPersonelRole=(Object.values(guildConfig.personelRolesInfo).find((roleInfo)=>(roleInfo.permissionLvl == targetPermissionLvl)) || {}).role;
		if (targetPersonelRole) {
			targetMemberDoc.rolesIds=targetMemberDoc.rolesIds.filter((roleId)=>(roleId != targetPersonelRole.id));
			if (targetNewPersonelRole) targetMemberDoc.rolesIds.push(targetNewPersonelRole.id);
		} else {
			if (targetMemberDoc.extraData.get("annoying")) return data.message.reply(lang("commands.punish.alreadyPunished"));
			if (parameters[1] == undefined) return data.message.reply(lang("commands.punish.noDuration"));
			if (isNaN(parameters[1])) return data.message.reply(lang("commands.punish.noDuration", {duration: parameters[1]}));
			let durationHours=Number(parameters[1]);
			targetMemberDoc.extraData.set("annoying", Date.now()+durationHours*3600000);
			targetMemberDoc.rolesIds=targetMemberDoc.rolesIds.filter((roleId)=>(roleId != guildConfig.userRole.id));
			targetMemberDoc.rolesIds.push(guildConfig.annoyingUserRole.id);
		}
		guildConfig.fixMemberRoles(targetMember, targetMemberDoc).then(()=>{
			message.reply(lang("commands.punish.success"));
		});
	}
};