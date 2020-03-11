

module.exports = {
    name:'load',
    description: 'Loads a command',
    cooldown: 0,
    args: true,
    guildonly: false,
    usage:"",
    hide:true,
    execute(message, args) { 
        if(message.author.id != process.env.MYID){
            return;
        }

        const commandName = args['args'][0].toLowerCase();
        const command = message.client.commands.get(commandName) ||
                        message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if(!command){
            try{
                const newCommand = require(`./${commandName}.js`);
                message.client.commands.set(newCommand.name, newCommand);
                if(newCommand.aliases){
                    newCommand.aliases.map(alias=>message.client.aliases.set(alias, newCommand));
                }
                cooldowns.set(command.name, new Discord.Collection());
                return message.channel.send(`Loaded ${commandName} command!`).then(msg=>{message.delete(3000);msg.delete(3000)});
            }catch (error){
                console.log(error);
                return message.channel.send(`An error occurred while reloading ${commandName}:\n\n${error.message}`).then(msg=>{message.delete(3000);msg.delete(3000)});
            }
        }

        return message.reply("Did you mean reload?");
    },

};