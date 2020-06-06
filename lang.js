const languageTabs = {
	pol: {
		error: "Błąd",
		commandNotFound: "Nie ma takiej komendy.",
		commands: {
			ping: (payload)=>(`Pinguję ${payload.user}!`),
			
		},
		actions: {

		},
	},
	eng: {
		error: "Error",
		commandNotFound: "This command doesn't exist.",
		commands: {
			ping: (payload)=>(`Pinging ${payload.user}!`),
			
		},
		actions: {
			
		},
	},
};

module.exports=(basePayload)=>{
	let languageManager={
		language: basePayload.language || (basePayload.server && basePayload.server.language) || "eng",
		get: (pathText, extraPayload)=>{
			let path=languageTabs[languageManager.language];
			for (let localisationName of pathText.split(".")) {
				if (path[localisationName]) path=path[localisationName];
				else {
					console.error(`Error: Lang get error for language ${languageManager.language}: ${pathText}`);
					if (languageManager.language == "eng") return null;
					else return module.exports({
						...basePayload,
						language: "eng"
					}).get(pathText, extraPayload);
				}
			}
			switch (typeof path) {
				case "string":
					return path;
				case "function":
					return path({
						...basePayload,
						...extraPayload
					});
				default:
					console.error(`Error: Lang get error2 for language ${languageManager.language}: ${pathText}`);
					return null;
			}
		}
	};
	return languageManager;
};