const axios = require("axios");

module.exports = {
    name:'artist',
    description: 'Search for an artist in Yande.re',
    usage: '<prefix>artist <name>',
    cooldown: 1,
    guildonly: false,
    args: true,
    async execute(message, args) { 
        response = await axios.get('https://yande.re/artist.json', {
            params: {
            order:"name",
            name:args.args.join('_')
            }
        }
        );
        
        if(response.data.length){
            let artists = [];
            let fields = [];

            for(let i = 0; i < response.data.length && i < 5; i++){
                artists[i] = response.data[i];
                let field = {
                    name: artists[i].name,
                    value: `https://yande.re/post?tags=${artists[i].name}\n`
                }

                if(artists[i].url){
                    field.value += artists[i].urls.reduce((returnString, current)=>returnString+current+'\n')
                }

                fields.push(field);
            }

            const embedObject = {
                title: 'Artist Search',
                author: {name: `Requested by ${message.author.username}`},
                fields: fields,
                timestamp : new Date(),
                color:Math.floor(Math.random()*0xffffff)
            }

            message.channel.send({embed:embedObject});
        }else{
            message.channel.send("No artists found");
        }

        message.channel.stopTyping(true);
    },

}