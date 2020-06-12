const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const memberDbSchema=new Schema({
	_id: {type: String},
	annoying: {type: Number},
	rolesIds: {type: Array, of: {type: String, unique: true}},
});

memberDbSchema.virtual("id").get(function() {
	return this._id;
});

memberDbSchema.set("toJSON", {
	virtuals: true
});

const MemberDb=mongoose.model("members", memberDbSchema);

module.exports=MemberDb;