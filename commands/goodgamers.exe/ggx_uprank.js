const { get } = require("mongoose");

module.exports={
	triggers: [
		["uprank"], ["rankup"]
	],
	func: async(data)=>{
		// init a language manager
		let lang=languageManager(data);
		let guildConfig=data.guildConfig;
		let message=data.message;
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
		let permissionLvl=data.permissionLvl;
		let targetPermissionLvl=guildConfig.calculatePermissionLvl(targetMember);


		if (!Object.values(data.guildConfig.rolesInfo).find((roleInfo)=>(roleInfo.permissionLvl == targetPermissionLvl+1))) return message.reply(lang("commands.uprank.cannotMore"));
		if (permissionLvl <= targetPermissionLvl) return message.reply(lang("commands.derank.youCannot"));
		let targetNewPermissionLvl=targetPermissionLvl+1;
		let targetNewPersonelRole=(Object.values(guildConfig.personelRolesInfo).find((roleInfo)=>(roleInfo.permissionLvl == targetNewPermissionLvl))).role;
		let targetPersonelRole=(Object.values(guildConfig.personelRolesInfo).filter((roleInfo)).find((roleInfo)=>(roleInfo.permissionLvl == targetPermissionLvl)) || {}).role;
		if (targetPersonelRole) targetMemberDoc.rolesIds=targetMemberDoc.rolesIds.filter((roleId)=>(roleId != targetPersonelRole.id));
		targetMemberDoc.rolesIds.push(targetNewPersonelRole.id);
		guildConfig.fixMemberRoles(targetMember, targetMemberDoc).then(()=>{
			message.reply(lang("commands.uprank.success"));
		});
	}
};