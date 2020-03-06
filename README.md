# DiscordBot

I made this project to learn more about JavaScript, MongoDB and some features of the discord API.
I'm currently following the [guide](https://discordjs.guide/) in discord.js

Use `npm install` to get dependencies.

I'm using dotenv to store environment variables, like the Discord Token and info related to connection to the MongoDB server I'm using.
Currently the variables used are:

| .env Variable        | Used as           |
| ------------- |:-------------:|
| TOKEN | Discord Bot Token |
| DBURL | MongoDB url |
| DBUSER | MongoDB user |
| DBPASS | DB user's pass | 
| DBAUTH | MongoDB auth DB |
| DBAUTHMECH | Type of DB auth|

Run `npm start` or `node index.js` to start the bot.
