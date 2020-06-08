const mongoose=require("mongoose");
const auth=require("./auth.json").mongodb;
mongoose.connect(`mongodb://${auth.username}:${auth.password}@gacko.pl/goodbot-exe`, {useNewUrlParser: true, useUnifiedTopology: true});

module.exports=mongoose;