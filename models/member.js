const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const memberDbSchema=new Schema({
	_id: {type: String},
	memberId: {type: String},
	guildId: {type: String},
	rolesIds: {type: Array, of: {type: String, unique: true}},
	isBot: {type: Boolean},
	extraData: {type: Map}, // used to store guild-specific member's data
});

const MemberDb=mongoose.model("members", memberDbSchema);

module.exports=MemberDb;