module.exports={
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
};