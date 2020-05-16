const ytdl = require("ytdl-core");

module.exports = {
    name:'play',
    description: 'Play music command',
    cooldown: 5,
    args: true,
    guildonly: true,
    usage:"<prefix>play <link>",
    hide:false,
    execute(message, args) { 
        let server_id = args['server']['server_id'];
        if(server_id in args['musicDispatchers']){ //Check if bot is playing something atm
            args['musicDispatchers'][server_id]['list'] = [...args['musicDispatchers'][server_id]['list'],args['args'][0]];
            return;
        }else{
            if(message.member.voice.channel){ //Create a connection to the voice channel and start playing music
                message.member.voice.channel.join().then(
                    connection =>{
                        const MakeDispatch = ()=>{
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
                        args['musicDispatchers'][server_id] = {dispatcher:null, list:[args['args'][0]], connection:connection, textChannel:message.channel};
                        MakeDispatch();

                    }
                );
            }
        }
        return;
    },
};