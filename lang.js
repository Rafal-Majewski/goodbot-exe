const languageTabs = {
	pol: {
		error: "Błąd",
		commandNotFound: "Nie ma takiej komendy.",
		commandNoPermission: "Nie możesz użyć tej komendy.",
		commands: {
			ping: (payload)=>(`Pinguję ${payload.user}!`),
			uprank: {
				youCannotMore: "Nie możesz już zuprankować tego użytkownika.",
				cannotMore: "Nie ma wyższej rangi.",
				success: "Zuprankowano pomyślnie.",
			},
			derank: {
				youCannot: "Nie możesz zderankować tego użytkownika.",
				cannotMore: "Nie ma niższej rangi.",
				success: "Zderankowano pomyślnie.",
			},
			punish: {
				alreadyPunished: "Użytkownik jest już ukarany.",
				noDuration: "Musisz podać długość.",
				invalidDuration: (payload)=>(`${payload.duration} nie jest poprawną liczbą.`),
				success: "Ukarano pomyślnie.",
			},
			pardon: {
				noNeed: "Użytkownik nie jest ukarany.",
				success: "Pomyślnie przeproszono.",
				cannot: "Nie można przeprosić tego użytkownika."
			},
		},
		actions: {

		},
		userNotProvided: "Nie podano docelowego użytkownika.",
		memberFromIdNotFound: (payload)=>(`Członek z id ${payload.targetMemberId} nie został znaleziony.`),
	},
	eng: {
		error: "Error",
		commandNotFound: "This command doesn't exist.",
		commandNoPermission: "You are not allowed to use this command.",
		commands: {
			ping: (payload)=>(`Pinging ${payload.user}!`),
			uprank: {
				youCannotMore: "You cannot uprank this user more.",
				cannotMore: "There is no higher rank.",
				success: "Successfully upranked."
			},
			derank: {
				youCannot: "You cannot derank this user.",
				cannotMore: "There is no lower rank.",
				success: "Successfully deranked."
			},
			punish: {
				alreadyPunished: "The user is already punished.",
				noDuration: "You need to provide a duration.",
				invalidDuration: (payload)=>(`${payload.duration} is not a valid number.`),
				success: "Successfully punished.",
				youCannot: "You cannot punish this user.",
			},
			pardon: {
				noNeed: "The user is not punished.",
				success: "Pardoned successfully.",
				cannot: "This user cannot be pardoned."
			},
		},
		actions: {
			
		},
		userNotProvided: "User not provided.",
		memberFromIdNotFound: (payload)=>(`Member with id ${payload.targetMemberId} was not found.`),
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