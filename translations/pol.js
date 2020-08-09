module.exports={
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
};