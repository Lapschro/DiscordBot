const fs = require('fs');

const Discord = require('discord.js');
const {config } = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

const client = new Discord.Client({
    disableEveryone: true,
}
);

client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.aliases = new Discord.Collection();
const defaultPrefix = "%";

const musicDispatchers = {
};

//Find all commands files
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

//Adds all commands to de commands dictionary
for(const file of commandFiles){
    const command = require(`./Commands/${file}`);

    client.commands.set(command.name, command);

    if(command.aliases){
        command.aliases.map(alias=>client.aliases.set(alias, command));
    }

    client.cooldowns.set(command.name, new Discord.Collection());
}


let dbClient;
let serverCollection;
let serverInfo;

//dotenv configuration
config({
    path: __dirname + '/.env',
})

//connection to mongodb
let mongodbSettings =  { 
    useUnifiedTopology:true, 
    auth:{user:process.env.DBUSER, 
        password:process.env.DBPASS}, 
    authSource:process.env.DBAUTH, 
    authMechanism:process.env.DBAUTHMECH,
    connectTimeoutMS:300
};

MongoClient.connect(process.env.DBURL, mongodbSettings,(err, db)=>{
    if(err) {
        console.log("Running on no DB mode");
        return;
    }

    var dbo = db.db("Servers");
    dbClient = db;
    if(dbClient.isConnected()){
        console.log("Connected to BD");
    }
    serverCollection = dbo.collection("ServerInfo");
    let collection = serverCollection.find({}).toArray((err, res)=>{
        if(err) throw err;
        //on success sets the dictionary with all servers
        serverInfo = {};
        res.map(x=>{serverInfo[x['server_id']] = x});
    });
});

//on SIGINT close connection
process.on("SIGINT", ()=>{
        if(dbClient){
            dbClient.close();
            console.log("Conenction to MongoDB Closed");
        }

        for(var key in musicDispatchers){    
            musicDispatchers[key].textChannel.send("Leaving due to bot turning off");
            musicDispatchers[key].dispatcher.destroy();
            musicDispatchers[key].connection.disconnect();
        }

        process.exit();
    }
);

//Starup of the bot and the on message behavior to check commands
StartDiscordBot();
function StartDiscordBot()  {
    client.on("ready", () =>{
        console.log("Online as "+client.user.tag);
    });

    client.on("voiceStateUpdate", (oldUser, newUser)=>{ //Check if the bot is alone in channel
        let newUserChannel = newUser.channel;
        let oldUserChannel = oldUser.channel;

        if(newUserChannel === null){
            let alone = true;
            
            oldUserChannel.members.forEach((value, key, map)=>{
                
                if(!value.user.bot){
                    alone = false;
                    return;
                }
            })

            if(oldUser.guild.id in musicDispatchers){
                musicDispatchers[oldUser.guild.id].textChannel.send("Leaving");
                musicDispatchers[oldUser.guild.id].dispatcher.destroy();
                musicDispatchers[oldUser.guild.id].connection.disconnect();
                delete musicDispatchers[oldUser.guild.id];
            }
        }
    });

    client.on("message", async (message) =>{
        let prefix = defaultPrefix;
        if(dbClient){
            if(message.guild !== null){ // If in server
                if(message.author.bot)  //We don't need to answer other bots
                    return;

                //Check if the server is new to the bot
                if(message.guild.id in serverInfo){
                    prefix = serverInfo[message.guild.id]['prefix'];
                }else{
                    //creates the server entry and adds to mongodb
                    newServer = {
                        server_id: message.guild.id,
                        prefix: defaultPrefix
                    };
                    serverCollection.insertOne(newServer, (err, res)=>{
                        if(err) throw err;
                    
                        serverInfo[message.guild.id] = res.ops[0];
                    });
                    prefix = defaultPrefix;
                }
            }else{ //In DMs use default prefix
                prefix = defaultPrefix;
            }
        }

        if(message.mentions.has(client.user)){
            message.content = (message.content.replace(new RegExp(`<@!${client.user.id}>\ |<@!${client.user.id}>`), prefix));
        }

        //checks if the message starts with the prefix
        if(!message.content.startsWith(prefix)){
            return;
        }
        
        //create an array of arguments to be passed to the functions
        let args = message.content.slice(prefix.length).split(/ +/);
        //the first part after the prefix is the command, so we shift it out
        const commandName = args.shift().toLowerCase();
        
        const command = client.commands.get(commandName) || client.aliases.get(commandName);
        //if the command doesn't exists then exit        
        if(!command)
            return;

        if(command.guildonly && message.channel.type !== 'text'){
            return message.reply("I can't execute this command inside DMs");
        }

        if(command.args && !args.length){
            message.channel.stopTyping(true);
            return message.channel.send(`${message.author} this command requires arguments!`);
        }

        //Checks for cooldowns
        let now = Date.now();
        const commandCooldown = client.cooldowns.get(command.name);
        const cooldownAmnt = (command.cooldown || 1) * 1000;

        if(commandCooldown.has(message.author.id)){
            const expirationTime = commandCooldown.get(message.author.id) + cooldownAmnt;
 
            if(now < expirationTime){
                const cooldownTime = (expirationTime - now)/1000;
                return message.reply(`Please wait ${cooldownTime.toFixed(1)} more seconds before using ${commandName}!`);
            }
        }

        //creates an argument to be passed to the command
        args = {
            args:args,
            server: serverInfo ? message.guild ? serverInfo[message.guild.id] : '' : '',
            serverCollection: serverCollection,
            connectedToDB: (dbClient?true:false),
            musicDispatchers : musicDispatchers
        };

        //calls the command
        try{
            command.execute(message, args);
            commandCooldown.set(message.author.id, now);
            
            setTimeout(()=>commandCooldown.delete(message.author.id), cooldownAmnt);
        }catch (error){
            console.error(error);
            message.channel.send("An error occurred while proccessing " + commandName);
            message.channel.stopTyping(true);
        }

    });

    client.login(process.env.TOKEN);
}
