const syncRolesInterval=40000;
const verificationMessageId="718821550190493726";
const verificationChannelId="595746118806274070";
const rolesChannelId="596825995642929181";
const lobbyChannelId="154685954953707521";
const userRoleId="251413729646870539";
const administrationRolesIds=["154690312336441344", "414863303635107851", "267388934454116352", "584098168107696133", "398540347728330752"];
let lobbyChannel;
let verificationMessage;
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

const syncRoles=()=>{
	MemberDb.find().then((memberDocs)=>{
		memberDocs.forEach((memberDoc)=>{
			members.fetch(memberDoc._id).then((member)=>{
				let memberRoles=member.roles.cache.array().map((role)=>(role.id));
				let memberDbRoles=memberDoc.rolesIds;
				let toRemove=memberRoles.filter((roleId)=>(!memberDbRoles.includes(roleId)));
				let toAdd=memberDbRoles.filter((roleId)=>(!memberRoles.includes(roleId)));
				toRemove.forEach((roleId)=>{
					member.roles.remove(roleId).then(async()=>{
						console.log(`GoodGamers.exe: User ${member.user.username} lost ${await roles.cache.get(roleId).name}.`);
					}).catch(()=>{});
				});
				toAdd.forEach((roleId)=>{
					member.roles.add(roleId).then(async()=>{
						console.log(`GoodGamers.exe: User ${member.user.username} got ${await roles.cache.get(roleId).name}.`);
					}).catch(()=>{});
				});
			}).catch((error)=>{
				//console.error(`GoodGamers.exe: Member ${memberDoc._id} not found.`);
			});
		});
	});
};

module.exports={
	id: "154685954953707521",
	commands: ["ping", "rankup", "rankdown"],
	actions: ["hitler"],
	commandPrefix: "/",
	rolesIdsHierarchy: ["398540347728330752", "584098168107696133", "267388934454116352", "154690312336441344"],
	//make it a global function, database optional
	//punish command, user -> annoying or unrank if >user
	onReady: async(guild)=>{
		members=guild.members;
		roles=guild.roles;
		userRole=await roles.fetch(userRoleId);
		lobbyChannel=guild.channels.cache.get(lobbyChannelId);
		rolesChannel=guild.channels.cache.get(rolesChannelId);
		verificationChannel=guild.channels.cache.get(verificationChannelId);
		verificationMessage=await verificationChannel.messages.fetch(verificationMessageId);
		//syncRoles();
		//setInterval(syncRoles, syncRolesInterval);
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
	onGuildMemberAdd: async(member)=>{
		let memberDoc=await getMemberDoc(member);
		memberDoc.rolesIds.forEach(async(roleId)=>{
			member.roles.add(roleId);
			console.log(`GoodGamers.exe: User ${member.user.username} got ${await roles.cache.get(roleId).name}.`);
		});
	},
	onGuildMemberRemove: async(member)=>{
		verificationMessage.reactions.cache.get("✅").users.remove(member.user.id);
		getMemberDoc(member).then((memberDoc)=>{
			let rolesIdsToRemove=[userRoleId, ...administrationRolesIds];
			let newRolesIds=memberDoc.rolesIds.filter((roleId)=>(!rolesIdsToRemove.includes(roleId)));
			if (memberDoc.rolesIds.length != newRolesIds.length) {
				memberDoc.rolesIds=newRolesIds;
				memberDoc.save();
			}
		}).catch((error)=>{console.error(error);});
	},
	onGuildMemberRoleAdd: (member, role)=>{
		getMemberDoc(member).then((memberDoc)=>{
			if (memberDoc.rolesIds.includes(role.id)) return;
			memberDoc.rolesIds.push(role.id);
			memberDoc.save();
		}).catch((error)=>{console.error(error);});
	},
	onGuildMemberRoleRemove: (member, role)=>{
		getMemberDoc(member).then((memberDoc)=>{
			if (!memberDoc.rolesIds.includes(role.id)) return;
			memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != role.id));
			memberDoc.save();
		}).catch((error)=>{console.error(error);});
	},
	onMessageReactionRemove: async(reaction, user)=>{
		if (user.bot) return;
		if (reaction.message.channel == rolesChannel) {
			let oldRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let oldRole=(await roles.fetch()).cache.find((role)=>(role.name == oldRoleName));
			if (oldRole) (await members.fetch(user.id)).roles.remove(oldRole);
			else console.error(`GoodBot.exe: Role with name ${oldRoleName} was not found.`);
		}
	},
	onMessageReactionAdd: async(reaction, user)=>{
		if (user.bot) return;
		if (reaction.message == verificationMessage) verifyMember(await members.fetch(user.id));
		else if (reaction.message.channel == rolesChannel) {
			let newRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let newRole=(await roles.fetch()).cache.find((role)=>(role.name == newRoleName));
			if (newRole) (await members.fetch(user.id)).roles.add(newRole);
			else console.error(`GoodBot.exe: Role with name ${newRoleName} was not found.`);
		}
	},
};