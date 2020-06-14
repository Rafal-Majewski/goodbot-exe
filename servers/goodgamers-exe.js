const syncWithDatabaseInterval=60000;
const emergencyInterval=60000;
const rainbowInterval=2000;
const rainbowDuration=12;
const categoriesInfo=[
	{
		id: "484824510902697995", // Welcome
		autoPermissions: false,
	},
	{
		id: "485094880557793301", // Server
		autoPermissions: false,
	},
].reduce((sum, value)=>{
	sum[value.id]=value;
	if (value.autoPermissions == undefined) value.autoPermissions=true;
	return sum;
}, {});
const channelsInfo=[
	{
		id: "540917696729055252", // new_users
		sync: false,
	},
	{
		id: "596825995642929181", // roles
		sync: false,
	},
	{
		id: "533639109600608266", // information
		sync: false, 
	},
	{
		id: "595746118806274070", // verification
		sync: false, 
	},
	{
		id: "706491691326242836", // our_servers
		sync: false, 
	},
	{
		id: "486156048668033044", // taking a nap
		sync: false, 
	},
	{
		id: "531175582893998081", // information (English)
		sync: false, 
	},
	{
		id: "196337857537769482", // informacje (Polski)
		sync: false, 
	},
	{
		id: "260085375190433792", // złote_myśli
		sync: false, 
	},
].reduce((sum, value)=>{
	sum[value.id]=value;
	if (value.sync == undefined) value.sync=true;
	return sum;
}, {});
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

module.exports={
	id: "154685954953707521",
	commands: ["ping", "punish", "derank", "uprank", "pardon"],
	actions: ["hitler"],
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
		memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>{
			let roleInfo=rolesInfo[roleId] || {isForBots: true, isForHumans: true};
			if (member.user.bot && !roleInfo.isForBots) return false;
			if (!member.user.bot && !roleInfo.isForHumans) return false;
			if (roleId == this.everyoneRole.id) return false;
			if (!this.roles.cache.has(roleId)) return false;
			if (roleInfo.onlyFor && !roleInfo.onlyFor.includes(memberDoc._id)) return false;
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
		await memberDoc.save();
	},
	verifyMember: async function(member) {
		if (member) {
			getMemberDoc(member).then(async(memberDoc)=>{
				if (memberDoc.annoying) {
					memberDoc.rolesIds.push(this.annoyingUserRole.id);
				}
				else {
					memberDoc.rolesIds.push(this.userRole.id);
				}
				await memberDoc.save();
				this.fixMemberRoles(member, memberDoc);
				this.lobbyChannel.messages.fetch({limit: 1}).then((messages)=>{
					let lastMessage=this.lobbyChannel.lastMessage
					let welcomeText=this.getWelcomeText(member);
					if (lastMessage.content != welcomeText) {
						this.lobbyChannel.send(welcomeText);
						console.log(`GoodGamers.exe: User ${member.user.username} verified.`);
					}
				}).catch((error)=>{console.trace(error);});
			});
		}
	},
	syncWithDatabase: async function() {
		console.log("GoodGamers.exe: Sync with database started.");
		await MemberDb.find().then((memberDocs)=>{
			memberDocs.forEach(async(memberDoc)=>{
				await this.members.fetch(memberDoc._id).then(async(member)=>{
					await this.fixMemberRoles(member, memberDoc);
				}).catch((error)=>{});
			});
		});
		console.log("GoodGamers.exe: Sync with database finished.");
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

		// let i=0;
		// (await this.members.fetch()).forEach(async(member)=>{
		// 	let memberDb=new MemberDb({_id: member.id, userId: member.user.id, isBot: member.user.bot, rolesIds: member.roles.cache.array().map((role)=>(role.id))});
		// 	await memberDb.save().then(()=>{
		// 		console.log(`sukces ${i}`);
		// 	}).catch((error)=>{
		// 		console.log(`blad ${i}`);
		// 		//console.trace(error);
		// 	});
		// 	++i;
		// });

		// setInterval(()=>{
		// 	let color=getRainbowColor(Date.now()/1000%rainbowDuration/rainbowDuration);
		// 	console.log("elo");
		// 	this.ownerRole.setColor([color.r, color.g, color.b]);
		// }, rainbowInterval);
		console.log("GoodGamers.exe: Ready.");
		this.syncWithDatabase();
		setInterval(()=>{this.syncWithDatabase();}, syncWithDatabaseInterval);
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
			let userDoc=await getUserDoc(user);
			userDoc.rolesIds=userDoc.rolesIds.filter((roleId)=>(roleId != oldRole.id))
			await userDoc.save();
			this.members.fetch(user.id).then(async(member)=>{
				this.fixMemberRoles(member, await getUserDoc(user));
			}).catch((error)=>{});
		}
	},
	onMessageReactionAdd: async function(reaction, user) {
		if (user.bot) return;
		if (reaction.message == this.verificationMessage) this.verifyMember(await this.members.fetch(user.id));
		else if (reaction.message.channel == this.rolesChannel) {
			let newRoleName=reaction.message.content.split(" ").slice(1).join(" ");
			let newRole=(await this.roles.fetch()).cache.find((role)=>(role.name == newRoleName));
			if (!newRole) return console.trace(`GoodGamers.exe: Role with name ${newRoleName} was not found.`);
			let userDoc=await getUserDoc(user);
			userDoc.rolesIds.push(newRole.id);
			await userDoc.save();
			this.members.fetch(user.id).then(async(member)=>{
				this.fixMemberRoles(member, userDoc);
			}).catch((error)=>{});
		}
	},
};