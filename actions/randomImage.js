const GoogleImages = require("google-images");

module.exports={
    trigger: (data)=>(Math.random() < 1),
    isOnlyForHumans: true,
    func: async(data)=>{
		let words=data.message.content.split(" ").filter((word)=>(word)).map((word)=>(word.trim())).sort(()=>(Math.random()-0.5));
		while (words.length != 0) {
			let word=words.pop();
			let images=await googleImagesClient.search(word);
			if (images.length != 0) {
				let image=images[Math.floor(Math.random()*images.length)];
				return data.channel.send({
					files: [image.url]
				});
			}
		}
    }
};