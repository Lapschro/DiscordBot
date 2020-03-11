const axios = require("axios");

module.exports = {
    name:'stock',
    description: 'Check a stock',
    cooldown: 10,
    args: true,
    guildonly: false,
    usage:"<prefix>stock <Stock code>",
    execute(message, args) { 
        message.channel.startTyping();
        stocks = require('../stocks.json');

        message.channel.startTyping();
        for (let stock of args['args']){
            
            if(stock.toUpperCase() in stocks){
                GetResponse(stocks, message, stock.toUpperCase());
            }
        }
        message.channel.stopTyping(true);
    },

};

async function GetResponse(stocks, message, code){
    response = await axios.get(`http://cotacoes.economia.uol.com.br/ws/asset/${stocks[code]['id']}/intraday` , {
        params: {
            size: 400,
        }
    });

    if(response.status !== 200){
        throw 'Error'
    }
    console.log(response.data.data[0]);

    const embedObject = {
        title: `Stock ${stocks[code]['name']}`,
        author: {name: `Requested by ${message.author.username}`},
        fields:[
            {
                name:'Price',
                value:`${response.data.data[0].price}`,
            },
            {
                name:'low',
                value:`${response.data.data[0].low}`,
            },
            {
                name:'high',
                value:`${response.data.data[0].high}`,
            },
            {
                name:'Var',
                value:`${response.data.data[0].var}`,
            },
            {
                name:'Var %',
                value:`${response.data.data[0].varpct}`,
            },
            {
                name:'Vol',
                value:`${response.data.data[0].vol}`,
            },
            {
                name:'At',
                value: new Date(response.data.data[0].date).toUTCString()
            }

        ],
        color:Math.floor(Math.random()*0xffffff),
    }

    message.channel.send({embed:embedObject});



}