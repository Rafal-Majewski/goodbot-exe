const auth=require("$auth.json").googleImages;

module.exports={
    trigger: (data)=>{
		// extract all the words from the message
		data.triggerPayload.words=data.message.content.split(" ").filter((word)=>(word)).map((word)=>(word.trim()));
		return Math.random() < -0.95/Math.pow(data.triggerPayload.words.length, 0.3)+1;
	},
    isOnlyForHumans: true,
    func: async(data)=>{
		// shuffle the words
		let words=data.triggerPayload.words.sort(()=>(Math.random()-0.5));
		while (words.length) {
			// get a random word from the message
			let word=words.pop();
			try {
				// make a http request to google custom search api with credentials and a random word from the message, then shuffle the returned images
				let images=(await axios.get(`https://www.googleapis.com/customsearch/v1?key=${auth.apiKey}&cx=${auth.cseId}&q=${encodeURIComponent(word)}`)).data.items.map((item)=>(item.pagemap.cse_image && item.pagemap.cse_image[0].src)).filter((url)=>(url)).sort(()=>(Math.random()-0.5));
				while (images.length) {
					// get a random image
					let image=images.pop();
					// test if the image is in one of the supported formats
					if (!/[\/.](gif|jpg|bmp|jpeg|tiff|png)$/i.test(image.url)) continue;
					// send the image to the channel
					return data.channel.send({
						files: [image.url]
					});
				}
			} catch {

			}
		}
    }
};