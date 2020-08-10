module.exports={
	triggers: [
		["pardon"],
		["przepros"],
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
		if (!targetMemberDoc.extraData.get("annoying")) return message.reply(lang("commands.pardon.noNeed"));
		targetMemberDoc.extraData.set("annoying", null);
		guildConfig.fixMemberRoles(targetMember, targetMemberDoc).then(()=>{
			return message.reply(lang("commands.pardon.success"));
		});
	}
};