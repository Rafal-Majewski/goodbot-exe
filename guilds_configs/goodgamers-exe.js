const syncWithDatabaseInterval=60000;
const emergencyInterval=60000; // interval in which to run the "emegency" function

const byeTexts=[
	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! What a loss...\n:flag_pl: ${member.user.username} opuścił nas! Co za strata...`),
	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! More slots for us!\n:flag_pl: ${member.user.username} opuścił nas! Więcej slotów dla nas!`),
	(member)=>(`:flag_us::flag_gb: User ${member.user.username} disappeared! Shall we inform his family?\n:flag_pl: Użytkownik ${member.user.username} zniknął! Powinniśmy poinformować jego rodzinę?`),
];

module.exports={
	id: "154685954953707521", // GoodGamers.exe's id
	commandsIds: ["ping", "ggx_punish", "ggx_derank", "ggx_uprank", "ggx_pardon"], // commands allowed on this guild listed by their ids
	commandsPermissionsLvl: { // permission lvl required to run a given command
		"punish": 4,
		"pardon": 4,
		"derank": 5,
		"uprank": 5,
	},
	messageActionsIds: ["randomImage"], // message actions allowed on this guild listed by their ids
	commandPrefix: "/",
	getByeText: function(member) {
		return byeTexts[Math.floor(Math.random()*byeTexts.length)](member);
	},
	getWelcomeText: function(member) {
		return `:flag_us::flag_gb: Hello <@${member.id}>! Head over to <#${this.rolesChannel.id}> if you want access to categories dedicated for specific languages. Use the :white_check_mark: emoticon below the languages you speak. You can get the Good user if you want to be notified about interesting offers and events.\n:flag_pl: Witaj <@${member.id}>! Przejdź na kanał <#${this.rolesChannel.id}> jeśli chcesz dostęp do kategorii dla konkretnych języków. Użyj emotikony :white_check_mark: pod językami, którymi mówisz. Możesz wziąć też rolę Good user, jeśli chcesz dostawać powiadomienia o ciekawych okazjach i wydarzeniach.`;
	},
	fixMemberRoles: async function(member, memberDoc) {
		if (memberDoc.annoying <= Date.now()) memberDoc.annoying=null;
		if (memberDoc.annoying) {
			if (!memberDoc.rolesIds.includes(this.annoyingUserRole.id)) memberDoc.rolesIds.push(this.annoyingUserRole.id);
			if (memberDoc.rolesIds.includes(this.userRole.id)) memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != this.userRole.id));
		} else {
			if (memberDoc.rolesIds.includes(this.annoyingUserRole.id)) {
				memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != this.annoyingUserRole.id));
				if (!memberDoc.rolesIds.includes(this.userRole.id)) memberDoc.rolesIds.push(this.userRole.id);
			}
		}
		let memberOtherPersonelRolesIds=Object.values(this.rolesInfo).filter((roleInfo)=>(roleInfo.type == "personel")).filter((roleInfo)=>(memberDoc.rolesIds.includes(roleInfo.id))).sort((roleInfo1, roleInfo2)=>(roleInfo2.permissionLvl-roleInfo1.permissionLvl)).slice(1).map((roleInfo)=>(roleInfo.id));
		
		memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>{
			let roleInfo=this.rolesInfo[roleId];
			if (member.user.bot && !roleInfo.isForBots) return false;
			if (!member.user.bot && !roleInfo.isForHumans) return false;
			if (roleId == this.everyoneRole.id) return false;
			if (!this.roles.cache.has(roleId)) return false;
			if (memberOtherPersonelRolesIds.includes(roleId)) return false;
			if (roleInfo.onlyFor && !roleInfo.onlyFor.includes(memberDoc.memberId)) return false;
			return true;
		});
		if (member) {
			let memberRolesIds=member.roles.cache.array().map((role)=>(role.id)).filter((roleId)=>(roleId != this.everyoneRole.id));
			let toAdd=memberDoc.rolesIds.filter((roleId)=>(!memberRolesIds.includes(roleId)));
			let toRemove=memberRolesIds.filter((roleId)=>(!memberDoc.rolesIds.includes(roleId)));
			toRemove.forEach((roleId)=>{
				member.roles.remove(roleId).then(()=>{
					console.log(`GoodGamers.exe: User ${member.user.username} lost ${this.roles.cache.get(roleId).name}.`);
				}).catch((error)=>{
					//console.trace(error);
				});
			});
			toAdd.forEach((roleId)=>{
				member.roles.add(roleId).then(()=>{
					console.log(`GoodGamers.exe: User ${member.user.username} got ${this.roles.cache.get(roleId).name}.`);
				}).catch((error)=>{
					//console.trace(error);
				});
			});
		}
		return memberDoc.save();
	},
	emergency: async function() {
		let checkCategoryPermissions=(channel, role)=>{
			if (this.categoriesInfo[channel.id]) return true;
			if (channel.permissionOverwrites.size != 3) return false;
			if (channel.permissionOverwrites.some((permissionOverwrite)=>(permissionOverwrite.id != this.everyoneRole.id && permissionOverwrite.id != this.botRole.id && permissionOverwrite.id != role.id))) return false;
			if (channel.permissionOverwrites.get(this.everyoneRole.id).allow.bitfield != 0) return false;
			if (channel.permissionOverwrites.get(this.everyoneRole.id).deny.bitfield != 1024) return false;
			if (channel.permissionOverwrites.get(this.botRole.id).allow.bitfield != 1024) return false;
			if (channel.permissionOverwrites.get(this.botRole.id).deny.bitfield != 0) return false;
			if (channel.permissionOverwrites.get(role.id).allow.bitfield != 1024) return false;
			if (channel.permissionOverwrites.get(role.id).deny.bitfield != 0) return false;
			
			return true;
		};
		this.channels.cache.forEach((channel)=>{
			if (channel.type == "category") {
				let categoryInfo=this.categoriesInfo[channel.id];
				if (categoryInfo.autoPermissions) {
					let role=this.roles.cache.find((role)=>(role.name == channel.name));
					if (!role) {
						return console.error(`GoodGamers.exe: Channel ${channel.name} has no corresponding role!`);
					}
					if (!checkCategoryPermissions(channel, role)) {
						channel.overwritePermissions([
							{
								id: this.everyoneRole,
								deny: ["VIEW_CHANNEL"],
							},
							{
								id: this.botRole,
								allow: ["VIEW_CHANNEL"],
							},
							{
								id: role.id,
								allow: ["VIEW_CHANNEL"],
							},
						]).then(()=>{console.log(`GoodGamers.exe: Permissions for ${channel.name} overwritten.`);});
					}
				}
			}
			else {
				if (!channel.parent) return console.error(`GoodGamers.exe: Channel ${channel.name} has no parent!`);
				let channelInfo=this.channelsInfo[channel.id];
				if (channelInfo.sync && !channel.permissionsLocked) channel.lockPermissions().then(()=>{console.log(`GoodGamers.exe: Permissions for ${channel.name} locked.`);});
			}
		});
		this.verificationMessage.reactions.cache.get("✅").users.fetch().then((users)=>{
			users.forEach((user)=>{
				this.members.fetch((user.id)).then(async(member)=>{
					let memberDoc=await getMemberDoc(member);
					if (!memberDoc.rolesIds.some((roleId)=>(roleId == this.botRole.id || roleId == this.annoyingUserRole.id || roleId == this.userRole.id))) {
						this.verifyMember(member, memberDoc);
					}
				}).catch((error)=>{});
			});
		});
		// console.log(await );
	},
	verifyMember: async function(member, memberDoc) {
		if (member) {
			if (!memberDoc) memberDoc=await getMemberDoc(member);
			if (memberDoc.annoying) {
				memberDoc.rolesIds.push(this.annoyingUserRole.id);
			}
			else {
				memberDoc.rolesIds.push(this.userRole.id);
			}
			await memberDoc.save();
			this.fixMemberRoles(member, memberDoc);
			this.lobbyChannel.messages.fetch({limit: 1}).then((messages)=>{
				let lastMessage=messages.first();
				let welcomeText=this.getWelcomeText(member);
				if (lastMessage.content != welcomeText) {
					this.lobbyChannel.send(welcomeText);
					console.log(`GoodGamers.exe: User ${member.user.username} verified.`);
				}
			})
		}
	},
	syncWithDatabase: async function() {
		console.log("GoodGamers.exe: Sync with database started.");
		MemberDb.find().then((memberDocs)=>{
			memberDocs.forEach(async(memberDoc)=>{
				this.members.fetch(memberDoc.memberId).then(async(member)=>{
					this.fixMemberRoles(member, memberDoc);
				}).catch((error)=>{});
			});
		});
	},
	calculatePermissionLvl: function(member) {
		return member.roles.cache.reduce((sum, role)=>{
			let roleInfo=this.rolesInfo[role.id];
			return (Math.abs(roleInfo.permissionLvl) > sum)?(roleInfo.permissionLvl):(sum);
		}, 0);
	},
	onReady: async function(guild) {
		this.guild=guild;
		this.members=guild.members;
		this.roles=guild.roles;
		this.channels=guild.channels;
		// categories info
		{
			let customInfo={
				"484824510902697995": { // Welcome
					hook: "welcome",
					autoPermissions: false,
				},
				"485094880557793301": { // Server
					hook: "welcome",
					autoPermissions: false,
				},
			};
			this.categoriesInfo=this.channels.cache.array().filter((channel)=>(channel.type == "category")).reduce((channelsInfo, channel)=>{
				let channelInfo={
					id: channel.id,
					autoPermissions: true,
					...customInfo[channel.id],
					category: channel,
				};
				if (channelInfo.hook) this[channelInfo.hook+"Category"]=channel;
				channelsInfo[channel.id]=channelInfo;
				return channelsInfo;
			}, {});
		}
		// channels info
		{
			let customInfo={
				"154685954953707521": {
					hook: "lobby",
				},
				"540917696729055252": { // new_users
					syncPermissions: false,
				},
				"596825995642929181": { // roles
					syncPermissions: false,
					hook: "roles",
				},
				"533639109600608266": { // information
					type: "information",
					syncPermissions: false,
				},
				"595746118806274070": { // verification
					syncPermissions: false,
					hook: "verification",
				},
				"486156048668033044": { // taking a nap
					syncPermissions: false,
				},
				"531175582893998081": {	// information (English)
					type: "information",
					syncPermissions: false,
				},
				"196337857537769482": { // informacje (Polish)
					type: "information",
					syncPermissions: false,
				},
				"260085375190433792": { // złote_myśli
					syncPermissions: false,
				},
				"484825110578987008": { // trash lobby
					syncPermissions: false,
				},
				"723201023065325649": { // trashland
					syncPermissions: false,
				},
			};
			this.channelsInfo=this.channels.cache.array().filter((channel)=>(channel.type == "voice" || channel.type == "text")).reduce((channelsInfo, channel)=>{
				let channelInfo={
					id: channel.id,
					syncPermissions: true,
					...customInfo[channel.id],
					channel,
				};
				if (channelInfo.hook) this[channelInfo.hook+"Channel"]=channel;
				channelsInfo[channel.id]=channelInfo;
				return channelsInfo;
			}, {});
		}
		// roles info
		{
			let customInfo={
				"154685954953707521": { // everyone
					hook: "everyone"
				},
				"414863303635107851": { // Creator
					type: "personel",
					onlyFor: ["145596608061374464"],
					permissionLvl: 6,
				},
				"154690312336441344": { // Owner
					type: "personel",
					permissionLvl: 5,
					hook: "owner",
				},
				"267388934454116352": { // Administrator
					type: "personel",
					permissionLvl: 4,
				},
				"584098168107696133": { // Moderator
					type: "personel",
					permissionLvl: 3,
				},
				"398540347728330752": { // Helper
					type: "personel",
					permissionLvl: 2,
				},
				"417749812801306626": { // Good user
					isForBots: false,
					isForHumans: true,
				},
				"330826381808107520": { // Bot
					isForBots: true,
					isForHumans: false,
					hook: "bot",
				},
				"251413729646870539": { // User
					isForBots: false,
					isForHumans: true,
					permissionLvl: 1,
					hook: "user",
				},
				"739594561097039873": { // Annoying user
					isForBots: false,
					isForHumans: true,
					permissionLvl: -1,
					hook: "annoyingUser",
				},
				"443476112614359050": { // Polski
					type: "language",
				},
				"443474364969648139": { // English
					type: "language",
				},
				"443474518980165643": { // toki pona
					type: "language",
				},
				"529037205713453087": { // Português
					type: "language",
				},
				"529283799440162852": { // Español
					type: "language",
				},
				"537516359907541012": { // Deutsch
					type: "language",
				},
				"443474589750657035": { // Türkçe
					type: "language",
				},
				"530873168945217546": { // Русский
					type: "language",
				},
				"531167504735928348": { // Français
					type: "language",
				},
				"555482960351068209": { // Italiana
					type: "language",
				},
				"585511234154004495": {// Română
					type: "language", 
				},
				"556581438963712000": { // Svenska
					type: "language",
				},
				"556581545410953216": { // Dansk
					type: "language",
				},
				"556582103027023893": { // Norsk
					type: "language",
				},
				"556582229002682370": { // Latina
					type: "language",
				},
				"565996996905664522": { // Afrikaans
					type: "language",
				},
				"655579902325555220": { // Українська
					type: "language",
				},
				"572046664890712074": { // Hrvatski
					type: "language",
				},
				"573269710624522240": { // Čeština
					type: "language",
				},
				"585793856747077633": { // 汉语
					type: "language",
				},
				"586613435211448321": { // Ελληνικά
					type: "language",
				},
				"592820420554784778": { // العَرَبِيَّة
					type: "language",
				},
			};
			this.rolesInfo=(await this.roles.fetch()).cache.array().reduce((rolesInfo, role)=>{
				let roleInfo={
					id: role.id,
					isForBots: false,
					isForHumans: true,
					...customInfo[role.id],
					role,
				};
				if (roleInfo.hook) this[roleInfo.hook+"Role"]=role;
				rolesInfo[role.id]=roleInfo;
				return rolesInfo;
			}, {});
			this.personelRolesInfo=Object.values(this.rolesInfo).reduce((personelRolesInfo, roleInfo)=>{
				if (roleInfo.type == "personel") personelRolesInfo[roleInfo.id]=roleInfo;
				return personelRolesInfo;
			}, {});
		}
		this.verificationMessage=await this.verificationChannel.messages.fetch("718821550190493726");
		console.log("GoodGamers.exe: Ready.");
		this.syncWithDatabase();
		this.emergency();
		// setInterval(()=>{this.syncWithDatabase();}, syncWithDatabaseInterval);
		// setInterval(()=>{this.emergency();}, emergencyInterval);
	},
	onMessage: function(message) {
		if (message.channel == this.rolesChannel) message.react("✅");
	},
	onGuildMemberAdd: async function(member) {
		this.fixMemberRoles(member, await getMemberDoc(member));
	},
	onGuildMemberRemove: async function(member) {
		this.verificationMessage.reactions.cache.get("✅").users.remove(member.user.id);
		getMemberDoc(member).then((memberDoc)=>{
			let rolesIdsToRemove=[this.userRole.id, ...this.personelRoles.map((role)=>(role.id))];
			memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(!rolesIdsToRemove.includes(roleId)));
			memberDoc.save();
		}).catch((error)=>{console.trace(error);});
	},
	// onGuildMemberRoleAdd: async function(member, role) {
	// 	this.fixMemberRoles(member, await getMemberDoc(member));
	// },
	// onGuildMemberRoleRemove: async function(member, role) {
	// 	this.fixMemberRoles(member, await getMemberDoc(member));
	// },
	onMessageReactionRemove: async function(reaction, user) {
		if (user.bot) return;
		if (reaction.message.channel == this.rolesChannel) {
			let oldRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let oldRole=(await this.roles.fetch()).cache.find((role)=>(role.name == oldRoleName));
			if (!oldRole) return console.trace(`GoodGamers.exe: Role with name ${oldRoleName} was not found.`);
			let member=await this.members.fetch(user.id);
			let memberDoc=await getMemberDoc(member);
			memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != oldRole.id))
			this.fixMemberRoles(member, memberDoc);
		}
	},
	onMessageReactionAdd: async function(reaction, user) {
		if (user.bot) return;
		if (reaction.message == this.verificationMessage) this.verifyMember(await this.members.fetch(user.id));
		else if (reaction.message.channel == this.rolesChannel) {
			let newRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let newRole=(await this.roles.fetch()).cache.find((role)=>(role.name == newRoleName));
			if (!newRole) return console.trace(`GoodGamers.exe: Role with name ${newRoleName} was not found.`);
			let member=await this.members.fetch(user.id);
			let memberDoc=await getMemberDoc(member);
			memberDoc.rolesIds.push(newRole.id);
			this.fixMemberRoles(member, memberDoc);
		}
	},
};