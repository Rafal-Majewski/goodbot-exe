const mongoose=require("mongoose");
const auth=require("./auth.json").mongodb;
mongoose.connect(`mongodb://${auth.username}:${auth.password}@${auth.host}/${auth.database}`, {useNewUrlParser: true, useUnifiedTopology: true});

module.exports=mongoose;