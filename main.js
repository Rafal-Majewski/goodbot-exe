const auth=require("./auth.json");
global.Discord=require("discord.js");
global.latinize=require("latinize");
const client=new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});
global.languageManager=require("./lang.js");
global.fs=require("fs");
global.MemberDb=require("./models/member.js");
global.mongoose=require("./mongoose.js");
global.getRainbowColor=(number)=>{
	number*=6;
	let r=0;
	let g=0;
	let b=0;
	if (number <= 1) {
		r=1;
		g=number;
	}
	else if (number <= 2) {
		r=1-(number-1);
		g=1;
	}
	else if(number <= 3) {
		g=1;
		b=(number-2);
	}
	else if (number <= 4) {
		g=1-(number-3);
		b=1;
	}
	else if (number <= 5) {
		r=(number-4);
		b=1;
	}
	else if( number <= 6) {
		r=1;
		b=1-(number-5);
	}
	return {r: 255*r, g: 255*g, b: 255*b};
};

global.getMemberDoc=(member)=>{
	return MemberDb.findOne({"_id": member.id}).then(async(memberDoc)=>{
		if (!memberDoc) memberDoc=await (new MemberDb({"_id": member.id, "isBot": member.user.bot, "rolesIds": member.roles.cache.array().map((role)=>(role.id))})).save();
		return memberDoc;
	}).catch((error)=>{throw error;});
};
global.getUserDoc=(user)=>{
	return MemberDb.findOne({"_id": user.id}).then(async(memberDoc)=>{
		if (!memberDoc) memberDoc=await (new MemberDb({"_id": user.id, "isBot": user.bot, "rolesIds": []})).save();
		return memberDoc;
	}).catch((error)=>{throw error;});
};
global.servers=fs.readdirSync("./servers").reduce((sum, value)=>{
	let server=require(`./servers/${value}`);
	sum[server.id]=server;
	return sum;
}, {});
const commands=fs.readdirSync("./commands").reduce((sum, value)=>{
	let command=require(`./commands/${value}`);
	command.triggers=command.triggers.map((trigger)=>(trigger.map((word)=>(latinize(word.toLowerCase())))));
	sum[value.slice(0, -3)]=command;
	return sum;
}, {});
const actions=fs.readdirSync("./actions").reduce((sum, value)=>{
	sum[value.slice(0, -3)]=require(`./actions/${value}`);
	return sum;
}, {});

client.on("ready", ()=>{
	Object.values(servers).forEach((server)=>{
		server.guild=client.guilds.cache.get(server.id);
		server.onReady && server.onReady(server.guild);
	});
});

// takeRoleFromMember: (member, role)=>{
// 	if (member) {
// 		console.log(member.user.username, role.name);
// 		member.roles.remove(role).then(()=>{
// 			getMemberDoc(member).then((memberDoc)=>{
// 				console.log(memberDoc);
// 				memberDoc.rolesIds=memberDoc.rolesIds.filter((roleId)=>(roleId != role.id));
// 				memberDoc.save();
// 			}).catch((error)=>{console.error(error);});
// 			console.log(`GoodGamers.exe: User ${member.user.username} lost ${role.name}.`);
// 		}).catch((error)=>{console.error(error);});
// 	}
// },
// giveRoleToMember: (member, role)=>{
// 	if (member) {
// 		console.log(member.user.username, role.name);
// 		member.roles.add(role).then(()=>{
// 			getMemberDoc(member).then((memberDoc)=>{
// 				memberDoc.rolesIds=[...new Set([...memberDoc.rolesIds, role.id])];
// 				memberDoc.save();
// 			}).catch((error)=>{console.error(error);});
// 			console.log(`GoodGamers.exe: User ${member.user.username} got ${role.name}.`);
// 		}).catch((error)=>{console.error(error);});
// 	}
// },

const callAction=(message)=>{
	let server=servers[(message.guild && message.guild.id) || "direct"];
	for (let actionId of server.actions) {
		let action=actions[actionId];
		if (action.isOnlyForHumans && message.author.bot) continue;
		let data={
			server: server,
			member: message.member,
			guild: message.guild,
			channel: message.channel,
			user: message.author,
			userId: message.author.id,
			message: message,
		};
		action.trigger(data) && action.func(data);
	}
};

const callCommand=(message)=>{
	if (message.author.bot) return;
	let server=servers[(message.guild && message.guild.id) || "direct"];
	let content=message.content;
	if (server.commandPrefix) {
		if (content.startsWith(server.commandPrefix)) content=content.substr(server.commandPrefix.length);
		else return;
	}
	content=content.replace(/\s\s+/g, " ");
	let splittedContent=content.split(" ");
	let validCommand=null;
	let validCommandTriggerLongestLength = 0;
	for (let commandId of server.commands) {
		for (let commandTrigger of commands[commandId].triggers) {
			if (commandTrigger.length > splittedContent.length) continue;
			let valid=true;
			for (let i=0; i<commandTrigger.length; ++i) {
				if (commandTrigger[i] != latinize(splittedContent[i]).toLowerCase()) {
					valid=false;
					break;
				} else valid=true;
			}
			if (valid) {
				if (!validCommand || commandTrigger.length > validCommandTriggerLongestLength) {
					validCommandTriggerLongestLength=commandTrigger.length;
					validCommand=commands[commandId];
				}
			}
		}
	}
	let parameters=splittedContent.slice(validCommandTriggerLongestLength);
	let data={
		server: server,
		guild: message.guild,
		userId: message.author.id,
		member: message.member,
		message: message,
		user: message.author,
		channel: message.channel,
		parameters: parameters
	};
	if (validCommand) validCommand.func(data);
	else if (server.commandPrefix) message.reply(languageManager(data).get("commandNotFound"));
};

client.on("message", (message)=>{
	let server=servers[(message.guild && message.guild.id) || "direct"];
	if (server) {
		if (server.actions) callAction(message);
		if (server.commands) callCommand(message);
		server.onMessage && server.onMessage(message);
	} else {
		console.log("There is no config for that server.");
	}
});

client.on("guildMemberRemove", (member)=>{
	let server=servers[(member.guild && member.guild.id) || "direct"];
	if (server) {
		server.onGuildMemberRemove && server.onGuildMemberRemove(member);
	} else {
		console.log("There is no config for that server.");
	}
});

client.on("guildMemberAdd", (member)=>{
	let server=servers[(member.guild && member.guild.id) || "direct"];
	if (server) {
		server.onGuildMemberAdd && server.onGuildMemberAdd(member);
	} else {
		console.log("There is no config for that server.");
	}
});

client.on("messageReactionAdd", async(reaction, user)=>{
	let server=servers[reaction.message.guild.id];
	if (server) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				console.error(error);
			}
		}
		server.onMessageReactionAdd && server.onMessageReactionAdd(reaction, user);
	} else {
		console.log("There is no config for that server.\n");
	}
});

client.on("guildMemberUpdate", async(oldMember, newMember)=>{
	let oldRoles=oldMember.roles.cache.array();
	let newRoles=newMember.roles.cache.array();
	let toRemove=oldRoles.filter((role)=>(!newRoles.includes(role)))[0];
	let toAdd=newRoles.filter((role)=>(!oldRoles.includes(role)))[0];
	let server=servers[newMember.guild.id];
	if (server) {
		if (toAdd) server.onGuildMemberRoleAdd && server.onGuildMemberRoleAdd(newMember, toAdd);
		if (toRemove) server.onGuildMemberRoleRemove && server.onGuildMemberRoleRemove(newMember, toRemove);
	} else {
		console.log("There is no config for that server.\n");
	}
});

client.on("messageReactionRemove", async(reaction, user)=>{
	let server=servers[reaction.message.guild.id];
	if (server) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				console.error(error);
			}
		}
		server.onMessageReactionRemove && server.onMessageReactionRemove(reaction, user);
	} else {
		console.log("There is no config for that server.\n");
	}
});

client.login(auth.discord.token);