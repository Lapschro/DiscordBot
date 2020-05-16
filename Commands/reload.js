

module.exports = {
    name:'reload',
    description: 'Reloads a command',
    cooldown: 0,
    args: false,
    guildonly: false,
    usage:"",
    hide:true,
    execute(message, args) { 
        if(message.author.id != process.env.MYID || !args['args'].length){
            message.channel.stopTyping(true);
            return;
        }

        const commandName = args['args'][0].toLowerCase();
        const command = message.client.commands.get(commandName) ||
                        message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if(!command){
            return message.channel.send("No command with that name!");
        }

        delete require.cache[require.resolve(`./${commandName}.js`)];

        try{
            const newCommand = require(`./${commandName}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            if(newCommand.aliases){
                newCommand.aliases.map(alias=>message.client.aliases.set(alias, newCommand));
            }
            return message.channel.send(`Reloaded ${commandName} command!`).then(msg=>{message.delete({timeout:3000, reason:"Yes"});msg.delete({timeout:3000, reason:"Yes"})});
        }catch (error){
            console.log(error);
            return message.channel.send(`An error occurred while reloading ${commandName}:\n\n${error.message}`).then(msg=>{message.delete(3000);msg.delete(3000)});
        }

    },

};