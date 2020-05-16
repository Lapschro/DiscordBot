module.exports = {
    name:'ping',
    description: 'Ping command',
    cooldown: 5,
    args: false,
    guildonly: false,
    usage:"<prefix>ping",
    hide:false,
    execute(message, args) { 
        message.channel.startTyping();
        message.channel.send("Pong");
        message.channel.stopTyping(true);
    },

};