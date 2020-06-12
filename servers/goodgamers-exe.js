const emergencyInterval=60000;
const rolesInfo=[
	{
		id: "414863303635107851", // Creator
		type: "personel",
		onlyFor: ["145596608061374464"],
	},
	{
		id: "154690312336441344", // Owner
		type: "personel",
	},
	{
		id: "584098168107696133", // Moderator
		type: "personel",
	},
	{
		id: "398540347728330752", // Helper
		type: "personel",
	},
	{
		id: "417749812801306626", // Good user
		isForBots: false,
		isForHumans: true,
	},
	{
		id: "330826381808107520", // Bot
		isForBots: true,
		isForHumans: false,
	},
	{
		id: "251413729646870539", // User
		isForBots: false,
		isForHumans: true,
	},
	{
		id: "329951924709490691", // Annoying user
		isForBots: false,
		isForHumans: true,
	},
	{
		id: "443476112614359050", // Polski
		type: "language",
	},
	{
		id: "443474364969648139", // English
		type: "language",
	},
	{
		id: "443474518980165643", // toki pona
		type: "language",
	},
	{
		id: "529037205713453087", // Português
		type: "language",
	},
	{
		id: "529283799440162852", // Español
		type: "language",
	},
	{
		id: "537516359907541012", // Deutsch
		type: "language",
	},
	{
		id: "443474589750657035", // Türkçe
		type: "language",
	},
	{
		id: "530873168945217546", // Русский
		type: "language",
	},
	{
		id: "531167504735928348", // Français
		type: "language",
	},
	{
		id: "555482960351068209", // Italiana
		type: "language",
	},
	{
		id: "585511234154004495", // Română
		type: "language",
	},
	{
		id: "556581438963712000", // Svenska
		type: "language",
	},
	{
		id: "556581545410953216", // Dansk
		type: "language",
	},
	{
		id: "556582103027023893", // Norsk
		type: "language",
	},
	{
		id: "556582229002682370", // Latina
		type: "language",
	},
	{
		id: "565996996905664522", // Afrikaans
		type: "language",
	},
	{
		id: "655579902325555220", // Українська
		type: "language",
	},
	{
		id: "572046664890712074", // Hrvatski
		type: "language",
	},
	{
		id: "573269710624522240", // Čeština
		type: "language",
	},
	{
		id: "585793856747077633", // 汉语
		type: "language",
	},
	{
		id: "586613435211448321", // Ελληνικά
		type: "language",
	},
	{
		id: "592820420554784778", // العَرَبِيَّة
		type: "language",
	},
].reduce((sum, value)=>{
	switch (value.type) {
		case "language":
			value.isForBots=false;
			value.isForHumans=true;
			break;
		case "personel":
			value.isForBots=false;
			value.isForHumans=true;
			break;
		default:
			if (value.isForBots == undefined) value.isForBots=true;
			if (value.isForBots == undefined) value.isForHumans=true;
	}
	sum[value.id]=value;
	return sum;
}, {});

const byeTexts=[
	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! What a loss...\n:flag_pl: ${member.user.username} opuścił nas! Co za strata...`),
	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! More slots for us!\n:flag_pl: ${member.user.username} opuścił nas! Więcej slotów dla nas!`),
	(member)=>(`:flag_us::flag_gb: User ${member.user.username} disappeared! Shall we inform his family?\n:flag_pl: Użytkownik ${member.user.username} zniknął! Powinniśmy poinformować jego rodzinę?`),
];
const getByeText=(member)=>(byeTexts[Math.floor(Math.random()*byeTexts.length)](member));

module.exports={
	id: "154685954953707521",
	commands: ["ping", "punish"],
	actions: ["hitler"],
	commandPrefix: "/",
	getWelcomeText: function(member) {return `:flag_us::flag_gb: Hello <@${member.id}>! Head over to <#${this.rolesChannel.id}> if you want access to categories dedicated for specific languages. Use the :white_check_mark: emoticon below the languages you speak. You can get the Good user if you want to be notified about interesting offers and events.\n:flag_pl: Witaj <@${member.id}>! Przejdź na kanał <#${this.rolesChannel.id}> jeśli chcesz dostęp do kategorii dla konkretnych języków. Użyj emotikony :white_check_mark: pod językami, którymi mówisz. Możesz wziąć też rolę Good user, jeśli chcesz dostawać powiadomienia o ciekawych okazjach i wydarzeniach.`;},
	verifyMember: function(member) {
		if (member) {
			getMemberDoc(member).then((memberDoc)=>{
				if (memberDoc.annoying) member.roles.add(annoyingUserRole).then(()=>{
						console.log(`GoodGamers.exe: User ${member.user.username} verified (annoying).`);
					}).catch((error)=>{console.trace(error);});
				else member.roles.add(this.userRole).then(()=>{
					console.log(`GoodGamers.exe: User ${member.user.username} verified.`);
				}).catch((error)=>{console.trace(error);});
				this.lobbyChannel.messages.fetch({limit: 1}).then((messages)=>{
					let lastMessage=this.lobbyChannel.lastMessage
					let welcomeText=this.getWelcomeText(member);
					if (lastMessage.content != welcomeText) this.lobbyChannel.send(welcomeText);
				}).catch((error)=>{console.error(error);console.error(new Error().stack);});
			});
		}
	},
	emergency: async function() {
		console.log("GoodGamers.exe: Emergency started.");
		await MemberDb.find().then((memberDocs)=>{
			memberDocs.forEach(async(memberDoc)=>{
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
				
				await this.members.fetch(memberDoc._id).then((member)=>{
					memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>{
						let roleInfo=rolesInfo[roleId] || {isForBots: true, isForHumans: true};
						if (member.user.bot && !roleInfo.isForBots) return false;
						if (!member.user.bot && !roleInfo.isForHumans) return false;
						if (!this.roles.cache.has(roleId)) return false;
						if (roleId == this.everyoneRole.id) return false;
						if (roleInfo.onlyFor && !roleInfo.onlyFor.includes(member.id)) return false;
						return true;
					});
					let memberRolesIds=member.roles.cache.array().map((role)=>(role.id)).filter((roleId)=>(roleId != this.everyoneRole.id));
					let toAdd=memberDoc.rolesIds.filter((roleId)=>(!memberRolesIds.includes(roleId)));
					let toRemove=memberRolesIds.filter((roleId)=>(!memberDoc.rolesIds.includes(roleId)));
					toRemove.forEach(async(roleId)=>{
						await member.roles.remove(roleId).then(async()=>{
							console.log(`GoodGamers.exe: User ${member.user.username} lost ${this.roles.cache.get(roleId).name}.`);
						}).catch((error)=>{console.trace(error);});
					});
					toAdd.forEach(async(roleId)=>{
						await member.roles.add(roleId).then(async()=>{
							console.log(`GoodGamers.exe: User ${member.user.username} got ${this.roles.cache.get(roleId).name}.`);
						}).catch((error)=>{
							console.trace(error);
						});
					});
				}).catch((error)=>{
					//console.trace(error);
					//console.trace(`GoodGamers.exe: Member ${memberDoc._id} not found.`);
				});
				await memberDoc.save();
			});
		});
		console.log("GoodGamers.exe: Emergency finished.");
	},
	onReady: async function(guild) {
		this.guild=guild;
		this.members=guild.members;
		this.roles=guild.roles;
		this.userRole=await this.roles.fetch("251413729646870539");
		this.everyoneRole=await this.roles.fetch("154685954953707521");
		this.lobbyChannel=this.guild.channels.cache.get("154685954953707521");
		this.rolesChannel=this.guild.channels.cache.get("596825995642929181");
		this.verificationChannel=this.guild.channels.cache.get("595746118806274070");
		this.annoyingUserRole=await this.roles.fetch("329951924709490691");
		this.ownerRole=await this.roles.fetch("154690312336441344");
		this.administratorRole=await this.roles.fetch("267388934454116352");
		this.verificationMessage=await this.verificationChannel.messages.fetch("718821550190493726");
		this.personelRoles=["154690312336441344", "267388934454116352", "584098168107696133", "398540347728330752"].map((roleId)=>(this.roles.cache.get(roleId)));
		//syncRoles();
		//syncWithDatabase();
		this.emergency();
		setInterval(()=>{this.emergency();}, emergencyInterval);
		// let i=0;
		// (await members.fetch()).forEach(async(member)=>{
		// 	let memberDb=new MemberDb({_id: member.id, rolesIds: member.roles.cache.array().map((role)=>(role.id))});
		// 	await memberDb.save().then(()=>{
		// 		console.log(`sukces ${i}`);
		// 	}).catch((error)=>{
		// 		console.log(`blad ${i}`);
		// 		//console.trace(error);
		// 	});
		// 	++i;
		// });


		console.log("GoodGamers.exe: Ready.");
	},
	onMessage: function(message) {
		if (message.channel == this.rolesChannel) message.react("✅");
	},
	onGuildMemberAdd: async function(member) {
		let memberDoc=await getMemberDoc(member);
		memberDoc.rolesIds.forEach(async(roleId)=>{
			member.roles.add(roleId);
			console.log(`GoodGamers.exe: User ${member.user.username} got ${await roles.cache.get(roleId).name}.`);
		});
	},
	onGuildMemberRemove: async function(member) {
		this.verificationMessage.reactions.cache.get("✅").users.remove(member.user.id);
		getMemberDoc(member).then((memberDoc)=>{
			let rolesIdsToRemove=[userRole.id, ...administrationRolesIds];
			let newRolesIds=memberDoc.rolesIds.filter((roleId)=>(!rolesIdsToRemove.includes(roleId)));
			if (memberDoc.rolesIds.length != newRolesIds.length) {
				memberDoc.rolesIds=newRolesIds;
				memberDoc.save();
			}
		}).catch((error)=>{console.trace(error);});
	},
	onGuildMemberRoleAdd: function(member, role) {
		getMemberDoc(member).then((memberDoc)=>{
			if (memberDoc.rolesIds.includes(role.id)) return;
			memberDoc.rolesIds.push(role.id);
			memberDoc.save();
		}).catch((error)=>{console.trace(error);});
	},
	onGuildMemberRoleRemove: function(member, role) {
		getMemberDoc(member).then((memberDoc)=>{
			if (!memberDoc.rolesIds.includes(role.id)) return;
			memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != role.id));
			memberDoc.save();
		}).catch((error)=>{console.trace(error);});
	},
	onMessageReactionRemove: async function(reaction, user) {
		if (user.bot) return;
		if (reaction.message.channel == this.rolesChannel) {
			let oldRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let oldRole=(await roles.fetch()).cache.find((role)=>(role.name == oldRoleName));
			if (oldRole) (await members.fetch(user.id)).roles.remove(oldRole);
			else console.trace(`GoodGamers.exe: Role with name ${oldRoleName} was not found.`);
		}
	},
	onMessageReactionAdd: async function(reaction, user) {
		if (user.bot) return;
		if (reaction.message == this.verificationMessage) this.verifyMember(await this.members.fetch(user.id));
		else if (reaction.message.channel == this.rolesChannel) {
			let newRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let newRole=(await roles.fetch()).cache.find((role)=>(role.name == newRoleName));
			if (newRole) (await members.fetch(user.id)).roles.add(newRole);
			else console.trace(`GoodGamers.exe: Role with name ${newRoleName} was not found.`);
		}
	},
};