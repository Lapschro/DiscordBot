const ytdl = require("ytdl-core");

module.exports = {
    name:'skip',
    description: 'Skip music command',
    cooldown: 5,
    args: false,
    guildonly: true,
    usage:"<prefix>skip",
    hide:false,
    execute(message, args) { 
        let server_id = args['server']['server_id'];
        connection = args['musicDispatchers'][server_id];

        const MakeDispatch = (connection)=>{
            let dispatcher = connection.play(ytdl(args['musicDispatchers'][server_id]['list'][0],{liveBuffer:1048576}));
            args['musicDispatchers'][server_id]['dispatcher'] = dispatcher;

            dispatcher.on('start', ()=>{
                console.log("Playing");
            })
            dispatcher.on('finish', ()=>{
                console.log("Finished Playing");
                args['musicDispatchers'][server_id]['list'] = args['musicDispatchers'][server_id]['list'].splice(1);
                if(args['musicDispatchers'][server_id]['list'].length > 0){
                    MakeDispatch();
                }else{
                    connection.disconnect();
                    delete args['musicDispatchers'][server_id];
                }
            })
        } 

        if(connection){ //if there's a connection, then the bot is playing something
            if(connection.dispatcher){
                connection.dispatcher.destroy();
                connection.dispatcher = null;

                connection.list = connection.list.slice(1);
                if(connection.list.length > 0){ //If there are more songs in the list play then
                    MakeDispatch(connection.connection);
                }else{
                    connection.connection.disconnect();
                    delete args['musicDispatchers'][server_id];
                }
            }
        }
    }
};