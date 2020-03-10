module.exports = {
    name:'help',
    description: 'Displays help',
    cooldown: 5,
    args: false,
    guildonly: false,
    usage:"<prefix>help",
    execute(message, args) { 
        message.channel.startTyping();
        const {commands} = message.client;
        const data = [];
        let prefix = '%';

        data.push("Here's a list of all available commands:\n");
        if(args['server'] != ''){
            prefix = args['server']['prefix'];
        }
        data.push(commands.filter(command=>!command.hide)
                .map(command=>`${command.name}: ${command.description}\nUsage: ${command.usage}\n`.replace('<prefix>', prefix)).join('\n'));

        message.channel.stopTyping(true);

        return message.author.send(data, {split:true}).then(
            ()=>{
                if(message.channel.type !== 'dm'){
                    message.reply("I've sent you a DM with all commands!");
                }
            }
        )
        .catch(error=>{
            console.error(`Could not sent a DM to ${message.author.tag}.\n`, error);
            message.reply("It seems that I can't send you a DM");
        });
    },

};