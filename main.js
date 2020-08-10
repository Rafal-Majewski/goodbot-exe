// ease working with file paths
// path starting with "$" will be interpreted as an absolute path (from the project directory)
{
	let Module=require("module");
	let requireOld=Module.prototype.require;
	Module.prototype.require=function(...args) {
		if (args[0][0] == "$") args[0]=__dirname+"/"+args[0].slice(1);
		return requireOld.apply(this, args);
	};
}

global.axios=require("axios"); // axios is used to perform http requests
global.fs=require("fs"); // fs is used to read directories and load all the files inside
global.readdirDeepSync=(path)=>{ // deep (recursive) version of fs.readdirSync
	if (path[0] == "$") path=__dirname+"/"+path.slice(1);
	let readdirRecSync=(path, paths)=>{
		let relativePaths=fs.readdirSync(path);
		relativePaths.forEach((relativePath)=>{
			if (fs.statSync(path+"/"+relativePath).isDirectory()) readdirRecSync(path+"/"+relativePath, paths);
			else paths.push(path+"/"+relativePath);
		});
		return paths;
	};
	return readdirRecSync(path, []);
};
// require json with authorization keys, tokens, passwords etc.
const auth=require("$auth.json");
global.Discord=require("discord.js");
// latinize(text) is used perform such convertions as "żółć" -> "zolc"
global.latinize=require("latinize");
// initialize the Discord client with some partials
// read about partials here: https://discordjs.guide/popular-topics/partials
const client=new Discord.Client({fetchAllMembers: true, partials: ["MESSAGE", "CHANNEL", "REACTION"]});
// languageManager is used to manage texts' language
global.languageManager=require("$language_manager.js");
// mongoose is used to handle data saving and loading (MongoDB)
global.mongoose=require("$mongoose.js");
// mongoose's member model
global.MemberDb=require("$models/member.js");

global.removeNonNumericCharacters=(text)=>(text.replace(/\D/g,''));


// get member's document
// if doesn't exit then create a new one and save it
global.getMemberDoc=(member)=>{
	let memberDocId=member.guild.id+"."+member.id;
	return MemberDb.findOne({"_id": memberDocId}).then(async(memberDoc)=>{
		if (!memberDoc) memberDoc=await (new MemberDb({
			"_id": memberDocId,
			"memberId": member.id,
			"guildId": member.guild.id,
			"isBot": member.user && member.user.bot,
			"rolesIds": member.roles && member.roles.cache.array().map((role)=>(role.id)) || [],
		})).save();
		return memberDoc;
	}).catch((error)=>{throw error;});
};

// load guilds' configs
const guildsConfigs=readdirDeepSync("$guilds_configs").reduce((guildsConfigs, path)=>{
	let guildConfig=require(path);
	guildsConfigs[guildConfig.id]=guildConfig;
	return guildsConfigs;
}, {});

// load commands
const commands=readdirDeepSync("$commands").reduce((commands, path)=>{
	let command=require(path);
	let id=path.split("/").pop().slice(0, -3);
	command.id=id;
	// latinize commands' triggers
	command.triggers=command.triggers.map((trigger)=>(trigger.map((word)=>(latinize(word.toLowerCase())))));
	commands[id]=command;
	return commands;
}, {});

// load actions
const actions=readdirDeepSync("$message_actions").reduce((actions, path)=>{
	let action=require(path);
	let id=path.split("/").pop().slice(0, -3);
	action.id=id;
	actions[id]=action;
	return actions;
}, {});

client.on("ready", ()=>{
	Object.values(guildsConfigs).forEach((guildConfig)=>{
		guildConfig.guild=client.guilds.cache.get(guildConfig.id);
		guildConfig.onReady && guildConfig.onReady(guildConfig.guild);
	});
});

const callMessageAction=async(message, guildConfig)=>{
	guildConfig.messageActionsIds.forEach(async(actionId)=>{
		let action=actions[actionId];
		if (action.isOnlyForHumans && message.author.bot) return;
		let data={
			guildConfig: guildConfig,
			member: message.member,
			guild: message.guild,
			channel: message.channel,
			user: message.author,
			userId: message.author.id,
			message: message,
			permissionLvl: await guildConfig.calculatePermissionLvl(message.member),
			triggerPayload: {}, // can be used to store data generated while testing the action trigger
		};
		action.trigger(data) && action.func(data);
	});
};

const callCommand=async(message, guildConfig)=>{
	// commands can't be invoked by bots
	if (message.author.bot) return;
	let content=message.content;
	// if the guild has a command prefix
	if (guildConfig.commandPrefix) {
		// if the message starts with the guild's prefix
		if (content.startsWith(guildConfig.commandPrefix)) {
			// substract it from the message's content
			content=content.substr(guildConfig.commandPrefix.length);
		}
		// else break the function, because the message is not a command
		else return;
	}
	// remove extra spaces
	content=content.replace(/\s\s+/g, " ");
	let splittedContent=content.split(" ");
	// variable to store detected command
	let validCommand=null;
	// variable to store the length of longest valid trigger
	//
	// suppose that you have the following two commands:
	// pingSomeone: /ping someone (@mention, text)
	// pingMe: /ping (text)
	// as you can see message such as "/ping someone @GHPL hello" can be interpered both as pingSomeone and pingMe
	// in such situations the bot should choose the command with the longest valid trigger (pingSomeone in this example)
	let validCommandTriggerLongestLength=0;
	// iterate over all commands allowed on this guild
	guildConfig.commandsIds.forEach((commandId)=>{
		commands[commandId].triggers.forEach((commandTrigger)=>{
			// if the trigger is longer than the splitted message content then it's surely not a valid trigger
			if (commandTrigger.length > splittedContent.length) return;
			// check if the trigger is valid
			let valid=true;
			for (let i=0; i<commandTrigger.length; ++i) {
				if (commandTrigger[i] != latinize(splittedContent[i]).toLowerCase()) {
					valid=false;
					break;
				} else valid=true;
			}
			// if the trigger is valid
			if (valid) {
				// and its trigger is longer than currently stored
				if (commandTrigger.length > validCommandTriggerLongestLength) {
					// set the trigger's length as the new longest one
					validCommandTriggerLongestLength=commandTrigger.length;
					// and save the trigger's command
					validCommand=commands[commandId];
				}
			}
		});
	});
	// substract the trigger from the message content to get the parameters
	let parameters=splittedContent.slice(validCommandTriggerLongestLength);
	let permissionLvl=guildConfig.calculatePermissionLvl && await guildConfig.calculatePermissionLvl(message.member);
	let data={
		guildConfig: guildConfig,
		guild: message.guild,
		userId: message.author.id,
		member: message.member,
		message: message,
		user: message.author,
		channel: message.channel,
		parameters: parameters,
		permissionLvl: permissionLvl,
	};
	// if there is a command detected in the message
	if (validCommand) {
		// check if the user does not have a permission to invoke this command
		if (guildConfig.commandsPermissionsLvl && guildConfig.commandsPermissionsLvl[validCommand.id] != undefined && guildConfig.commandsPermissionsLvl[validCommand.id] > permissionLvl) message.reply(languageManager(data)("commandNoPermission"));
		// else invoke the function
		else validCommand.func(data);
	}
	// else inform the user that they did not send a valid command
	else if (guildConfig.commandPrefix) message.reply(languageManager(data)("commandNotFound"));
};

client.on("message", (message)=>{
	// get message's guild config
	// "direct" meaning it's a direct message
	let guildConfig=guildsConfigs[(message.guild && message.guild.id) || "direct"];
	if (guildConfig) {
		if (guildConfig.messageActionsIds) callMessageAction(message, guildConfig);
		if (guildConfig.commandsIds) callCommand(message, guildConfig);
		guildConfig.onMessage && guildConfig.onMessage(message);
	} else {
		console.log("There is no config for that guildConfig.");
	}
});

client.on("guildMemberRemove", (member)=>{
	// get member's guild config
	let guildConfig=guildsConfigs[member.guild.id];
	if (guildConfig) {
		guildConfig.onGuildMemberRemove && guildConfig.onGuildMemberRemove(member);
	} else {
		console.log("There is no config for that guildConfig.");
	}
});

client.on("guildMemberAdd", (member)=>{
	// get member's guild config
	let guildConfig=guildsConfigs[member.guild.id];
	if (guildConfig) {
		guildConfig.onGuildMemberAdd && guildConfig.onGuildMemberAdd(member);
	} else {
		console.log("There is no config for that guildConfig.");
	}
});

client.on("messageReactionAdd", async(reaction, user)=>{
	// get message's guild config
	// "direct" meaning it's a direct message
	let guildConfig=guildsConfigs[reaction.message.guild.id || "direct"];
	if (guildConfig) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				console.error(error);
			}
		}
		guildConfig.onMessageReactionAdd && guildConfig.onMessageReactionAdd(reaction, user);
	} else {
		console.error("There is no config for that guildConfig.");
	}
});

client.on("guildMemberUpdate", async(oldMember, newMember)=>{
	let oldRoles=oldMember.roles.cache.array();
	let newRoles=newMember.roles.cache.array();
	let removedRoles=oldRoles.filter((role)=>(!newRoles.includes(role)))[0];
	let addedRoles=newRoles.filter((role)=>(!oldRoles.includes(role)))[0];
	let guildConfig=guildsConfigs[newMember.guild.id];
	if (guildConfig) {
		if (addedRoles) guildConfig.onGuildMemberRoleAdd && guildConfig.onGuildMemberRoleAdd(newMember, addedRoles);
		if (removedRoles) guildConfig.onGuildMemberRoleRemove && guildConfig.onGuildMemberRoleRemove(newMember, removedRoles);
	} else {
		console.log("There is no config for that guildConfig.\n");
	}
});

client.on("messageReactionRemove", async(reaction, user)=>{
	let guildConfig=guildsConfigs[reaction.message.guild.id];
	if (guildConfig) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				console.error(error);
			}
		}
		guildConfig.onMessageReactionRemove && guildConfig.onMessageReactionRemove(reaction, user);
	} else {
		console.log("There is no config for that guildConfig.\n");
	}
});

client.login(auth.discord.token);