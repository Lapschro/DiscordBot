const axios = require("axios");
const Discord = require("discord.js");


module.exports = {
    name:'yan',
    description: 'Yande.re search!',
    usage: '<prefix>yan [<tags>]',
    aliases:["yandere"],
    cooldown: 1,
    guildonly: false,
    args: false,
    async execute(message, args) { 
        message.channel.startTyping();

        response = await axios.get('https://yande.re/post.json', {
            params: {
            limit: 100,
            tags:args.args.join(' ')
            }
        }
        );
        
        if(response.data.length){
            let post = Math.floor(Math.random()*response.data.length);

            let description = '';

            tags = response.data[post].tags.split(' ');

            tags.map((tag)=>{
                description += `[${tag.split('_').join(' ')}](https://yande.re/post?tags=${tag} '${tag.split('_').join(' ')}'), `
            });

            description = description.substr(0, description.length - 2);
            const embedObject = {
                title: 'Yandere Search',
                author: {name: `Requested by ${message.author.username}`},
                description: description,
                image: {
                    url:`${response.data[post].sample_url}`   
                },
                fields:[
                    {
                        name:'Yandere Post',
                        value:`[Post](https://yande.re/post/show/${response.data[post].id} 'Post')`,
                        inline: true
                    },
                    {
                        name:'Original Image',
                        value:`[Image](${response.data[post].file_url})`,
                        inline: true,
                    }
                ],
                timestamp : new Date(),
                color:Math.floor(Math.random()*0xffffff)
            }

            message.channel.send({embed:embedObject});
        }else{
            message.channel.send("No posts found");
        }

        message.channel.stopTyping(true);
    },

}