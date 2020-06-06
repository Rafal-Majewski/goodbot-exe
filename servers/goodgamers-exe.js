const verificationMessageId="718821550190493726";
const rolesChannelId="596825995642929181";
const lobbyChannelId="154685954953707521";
const userRoleId="251413729646870539";
let lobbyChannel;
let rolesChannel;
let roles;
let members;

const getWelcomeText=(member)=>(`:flag_us::flag_gb: Hello <@${member.id}>! Head over to <#596825995642929181> if you want access to categories dedicated for specific languages. Use the :white_check_mark: emoticon below the languages you speak. You can get the Good user if you want to be notified about interesting offers and events.\n:flag_pl: Witaj <@"+member.id+">! Przejdź na kanał <#596825995642929181> jeśli chcesz dostęp do kategorii dla konkretnych języków. Użyj emotikony :white_check_mark: pod językami, którymi mówisz. Możesz wziąć też rolę Good user, jeśli chcesz dostawać powiadomienia o ciekawych okazjach i wydarzeniach.`);

// const byeTexts=[
// 	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! What a loss...\n:flag_pl: ${member.user.username} opuścił nas! Co za strata...`),
// 	(member)=>(`:flag_us::flag_gb: ${member.user.username} left us! More slots for us!\n:flag_pl: ${member.user.username} opuścił nas! Więcej slotów dla nas!`),
// 	(member)=>(`:flag_us::flag_gb: User ${member.user.username} disappeared! Shall we inform his family?\n:flag_pl: Użytkownik ${member.user.username} zniknął! Powinniśmy poinformować jego rodzinę?`),
// ];
// const getByeText=(member)=>byeTexts[ghlib.random(0, byeTexts.length-1, "int")](member);


const verifyMember=(member)=>{
	if (member && !member.user.bot) {
		member.roles.add(userRole).then(()=>{
			console.log(`GoodGamers.exe: User ${member.user.username} verified.`);
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
		console.log("GoodBot.exe: Ready.");
	},
	onMessageReactionAdd: (reaction, user)=>{
		if (reaction.message.id == verificationMessageId) members.fetch(user.id).then((member)=>{verifyMember(member)}).catch((error)=>{console.error();})
	},
};