module.exports={
    trigger: (data)=>(data.message.content.toLowerCase().includes("hitler")),
    isOnlyForHumans: true,
    func: (data)=>{
        data.channel.send("Heil Hitler!", {
            files: ["https://s.ciekawostkihistoryczne.pl/uploads/2017/05/Adolf_Hitler.jpg"]
        });
    }
};