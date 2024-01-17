const {Client, IntentsBitField, AutocompleteInteraction, CommandInteractionOptionResolver} = require('discord.js');
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
    
    if(interaction.isAutocomplete()){
        console.log("Autocomplete interaction");
        (async () =>{
            interaction = AutocompleteInteraction(interaction);
            const focused = interaction.options.getFocused().value;
            const choices = ["Barbell Bench", "Dumbbell Bench"];
            const filtered = choices.filter(choice => choice.startsWith(focused));
            await interaction.respond(
                filtered.map(choice => ({name: choice, value: choice})),
            );
        })
    }

    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === "help"){

    }
})

client.login(process.env.TOKEN);
//client.login("MTE5NTg3MjI2NzE1MDgzNTgzNQ.GewRlR.o1mK7pxufXiXSi3HKGFjmmkFo_pBtgz4EeBQdk");