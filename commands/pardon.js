module.exports={
	triggers: [
		["pardon"],
		["przepros"],
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
			let targetMemberDoc=await getMemberDoc(targetMember);
			if (targetMember.id == "217693939229130752") return message.reply(lang.get("commands.pardon.cannot"));
			if (!targetMemberDoc.annoying) return message.reply(lang.get("commands.pardon.noNeed"));
			targetMemberDoc.annoying=null;
			targetMemberDoc.save().then(()=>{
				data.server.fixMemberRoles(targetMember, targetMemberDoc);
				return message.reply(lang.get("commands.pardon.success"));
			});
		}).catch((error)=>{
			console.error(error);
			message.reply(lang.get("memberFromIdNotFound", {targetMemberId}));
		});
	}
};