const {Client, IntentsBitField} = require('discord.js');
require("dotenv").config();
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        ],
});

client.on("ready", (c) => {
    console.log(`${c.user.tag} is ready for gains.`);
});

//Interaction is the event triggered when someone uses a command
client.on("interactionCreate", (interaction) =>{
    if(!interaction.isChatInputCommand()) return;
    
    console.log(interaction);
    
    if(interaction.commandName === "help"){

    }
})

client.login(process.env.TOKEN);
//client.login("MTE5NTg3MjI2NzE1MDgzNTgzNQ.GewRlR.o1mK7pxufXiXSi3HKGFjmmkFo_pBtgz4EeBQdk");