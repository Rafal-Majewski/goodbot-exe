module.exports={
	triggers: [
		["ping"],
		["przetestuj", "internet"],
	],
	func: (data)=>{
		let lang=languageManager(data);
		data.channel.send(lang("commands.ping"));
	}
};