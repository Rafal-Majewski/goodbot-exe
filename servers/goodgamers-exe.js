const verificationMessageId="718821550190493726";
const rolesChannelId="596825995642929181";
const lobbyChannelId="154685954953707521";
const userRoleId="251413729646870539";
let lobbyChannel;
let rolesChannel;
let roles;
let members;

const getWelcomeText=(member)=>(`:flag_us::flag_gb: Hello <@${member.id}>! Head over to <#${rolesChannelId}> if you want access to categories dedicated for specific languages. Use the :white_check_mark: emoticon below the languages you speak. You can get the Good user if you want to be notified about interesting offers and events.\n:flag_pl: Witaj <@${member.id}>! Przejdź na kanał <#${rolesChannelId}> jeśli chcesz dostęp do kategorii dla konkretnych języków. Użyj emotikony :white_check_mark: pod językami, którymi mówisz. Możesz wziąć też rolę Good user, jeśli chcesz dostawać powiadomienia o ciekawych okazjach i wydarzeniach.`);

// const byeTexts=[
// 	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! What a loss...\n:flag_pl: ${member.user.username} opuścił nas! Co za strata...`),
// 	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! More slots for us!\n:flag_pl: ${member.user.username} opuścił nas! Więcej slotów dla nas!`),
// 	(member)=>(`:flag_us::flag_gb: User ${member.user.username} disappeared! Shall we inform his family?\n:flag_pl: Użytkownik ${member.user.username} zniknął! Powinniśmy poinformować jego rodzinę?`),
// ];
// const getByeText=(member)=>byeTexts[ghlib.random(0, byeTexts.length-1, "int")](member);


const verifyMember=(member)=>{
	if (member) {
		member.roles.add(userRole).then(()=>{
			console.log(`GoodGamers.exe: User ${member.user.username} verified.`);
		}).catch((error)=>{console.error(error);});
		lobbyChannel.send(getWelcomeText(member));
	}
};

const getMemberDoc=(member)=>{
	return MemberDb.findOne({"_id": member.id}).then(async(memberDoc)=>{
		if (!memberDoc) memberDoc=await (new MemberDb({_id: member.id, rolesIds: member.roles.cache.array().map((role)=>(role.id))})).save();
		return memberDoc;
	}).catch((error)=>{throw error;});
};

const takeRoleFromMember=(member, role)=>{
	if (member) {
		getMemberDoc(member).then((memberDoc)=>{
			memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != role.id));
			memberDoc.save();
		}).catch((error)=>{console.error(error);});
		member.roles.remove(role).then(async()=>{
			
			console.log(`GoodGamers.exe: User ${member.user.username} lost ${role.name || role}.`);
		}).catch((error)=>{console.error(error);});
	}
};

const giveRoleToMember=(member, role)=>{
	if (member) {
		getMemberDoc(member).then((memberDoc)=>{
			memberDoc.rolesIds=[...new Set([...memberDoc.rolesIds, role.id])];
			memberDoc.save();
		}).catch((error)=>{console.error(error);});

		member.roles.add(role).then(()=>{
			console.log(`GoodGamers.exe: User ${member.user.username} got ${role.name || role}.`);
		}).catch((error)=>{console.error(error);});
	}
};

module.exports={
	id: "154685954953707521",
	commands: ["ping"],
	actions: ["hitler"],
	commandPrefix: "/",
	onStart: async(guild)=>{
		members=guild.members;
		roles=guild.roles;
		userRole=await roles.fetch(userRoleId);
		lobbyChannel=guild.channels.cache.get(lobbyChannelId);
		rolesChannel=guild.channels.cache.get(rolesChannelId);
		// let i=0;
		// (await members.fetch()).forEach(async(member)=>{
		// 	let memberDb=new MemberDb({_id: member.id, rolesIds: member.roles.cache.array().map((role)=>(role.id))});
		// 	await memberDb.save().then(()=>{
		// 		console.log(`sukces ${i}`);
		// 	}).catch((error)=>{
		// 		console.log(`blad ${i}`);
		// 		//console.error(error);
		// 	});
		// 	++i;
		// });


		console.log("GoodBot.exe: Ready.");
	},
	onMessage: (message)=>{
		if (message.channel == rolesChannel) message.react("✅");
	},
	onMessageReactionRemove: async(reaction, user)=>{
		if (user.bot) return;
		if (reaction.message.channel == rolesChannel) {
			let oldRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let oldRole=(await roles.fetch()).cache.find((role)=>(role.name == oldRoleName));
			if (oldRole) takeRoleFromMember(await members.fetch(user.id), oldRole);
			else console.error(`GoodBot.exe: Role with name ${newRoleName} was not found.`);
		}
	},
	onMessageReactionAdd: async(reaction, user)=>{
		if (user.bot) return;
		if (reaction.message.id == verificationMessageId) verifyMember(await members.fetch(user.id));
		else if (reaction.message.channel == rolesChannel) {
			let newRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let newRole=(await roles.fetch()).cache.find((role)=>(role.name == newRoleName));
			if (newRole) giveRoleToMember(await members.fetch(user.id), newRole);
			else console.error(`GoodBot.exe: Role with name ${newRoleName} was not found.`);
		}
	},
};