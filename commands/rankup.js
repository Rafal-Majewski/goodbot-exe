module.exports={
	triggers: [
		["rankup"],
	],
	func: async(data)=>{
		let lang=languageManager(data);
		let member=data.message.mentions.members.first();
		for (let i=0; i<data.server.rolesIdsHierarchy.length; ++i) {
			let roleId=data.server.rolesIdsHierarchy[i];
			console.log(i, roleId);
			if (member.roles.cache.has(roleId)) {
				console.log(i, i+1, data.server.rolesIdsHierarchy.length, i+1 >= data.server.rolesIdsHierarchy.length);
				if (i+1 >= data.server.rolesIdsHierarchy.length) {
					data.message.reply("Sorry, the member cannot be promoted.");
				}
				else {
					data.message.reply("test.");
					data.server.takeRoleFromMember(member, data.guild.roles.cache.get(data.server.rolesIdsHierarchy[i]));
					data.server.giveRoleToMember(member, data.guild.roles.cache.get(data.server.rolesIdsHierarchy[i+1]));
				}
				//console.log("yes", roleId);
				break;
			}
		}
	}
};