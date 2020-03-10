module.exports = {
    name:'prefix',
    description: 'Set prefix',
    args: true,
    guildonly:true,
    usage:"<prefix>prefix <new prefix>",
    execute(message, args) { 
        message.channel.startTyping();
        if(args['args'].length > 0){
            var myObj = {
                $set: {
                    prefix:args['args'][0],
                }
            }

            args['serverCollection'].updateOne(args['server'], myObj, (err, res)=>{
                if(err) throw err;
                args['server']['prefix'] = args['args'][0];
            });
            message.reply(" prefix set to "+args['args'][0]);

        }else{
            message.reply("No arguments were provided");
        }

        message.channel.stopTyping(true);
    },
};