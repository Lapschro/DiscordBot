module.exports = {
    name:'ping',
    description: 'Ping command',
    cooldown: 5,
    args: false,
    guildonly: false,
    execute(message, args) { 
        message.channel.send("Pong");
        message.channel.stopTyping(true);
    },

};