module.exports = {
    name:'list',
    description: 'list songs in queue',
    cooldown: 5,
    args: false,
    guildonly: true,
    usage:"<prefix>list",
    hide:false,
    execute(message, args) { 
        let server_id = args['server']['server_id'];
        if(args['musicDispatchers'][server_id]){
            console.log(args['musicDispatchers'][server_id]['list']);
            args['musicDispatchers'][server_id]['list'].map((song)=>{
                message.channel.send(song);
            })
        }else{
            message.channel.send("No songs on queue");
        }
        return;
    },
};