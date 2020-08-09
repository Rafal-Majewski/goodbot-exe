const translations=readdirDeepSync("$translations").reduce((translations, path)=>{
	let translation=require(path);

	let id=path.split("/").pop().slice(0, -3);
	translations[id]=translation;
	return translations;
}, {});

module.exports=(basePayload)=>((path, extraPayload)=>{
	let language=(extraPayload && extraPayload.language) || basePayload.language || (basePayload.guildConfig && basePayload.guildConfig.language) || "eng";
	let translation=translations[language];
	path.split(".").forEach((relativePath)=>{
		if (translation[relativePath]) translation=translation[relativePath];
		else {
			console.error(`Error: Lang get error for language ${language}: ${path}`);
			if (language == "eng") return null;
			else return module.exports({
				...basePayload,
				language: "eng"
			})(translation, extraPayload);
		}
	});
	switch (typeof translation) {
		case "string":
			return translation;
		case "function":
			return translation({
				...basePayload,
				...extraPayload
			});
		default:
			console.error(`Error: Lang get error2 for language ${language}: ${path}`);
			return null;
	}
});