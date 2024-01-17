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
    
    if(interaction.isAutocomplete() && interaction.commandName === "log"){
        const focused = interaction.options.getFocused();
        const choices = [
            "Barbell Bench Press", "Dumbbell Bench Press", "Chest Press Machine",
            "Incline Barbell Bench Press", "Incline Dumbbell Bench Press", "Incline Chest Press Machine",
            "Decline Barbell Bench Press", "Decline Dumbbell Bench Press", "Decline Chest Press Machine",
            "Dip", "Assissted Dip", "Barbell Shoulder Press/Military Press",
            "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press",
            "Lateral Raise", "Cable Lateral Raise", "Machine Lateral Raise",
            "Front Cable Raise", "Front Dumbbell Raise", "Pull Up", "Chin Up",
            "Assissted Pullup", "Lat Pulldown", "Lat Pullover", "Single Arm Pulldown",
            "Barbell Row", "T Bar Row", "Landmine", "Machine Row",
            "Machine Pulldown", "Cable Row", "Face Pull",
            "Rear Delt Fly", "Rear Delt Ski", "Romanian Deadlift",
            "Bulgarian Split Squat", "Good Morning", "Lunge",
            "Reverse Lunge", "Hip Abduction", "Hip Adduction",
            "Calf Raise", "Cable Crunch", "Goblett Squat",
            "Barbell Squat", "Leg Extension", "Hamstring Curl",
            "Lying Hamstring Curl", "Deadlift", "Tricep Pulldown",
            "Overhead Tricep Extension", "Tricep Pushdown", "Single Arm Tricep Extension",
            "Tricep Machine", "Dumbbell Bicep Curl", "Hammer Curl", "Zottman Curl",
            "Barbell Bicep Curl", "Preacher Curl", "Bicep Curl Machine", "Preacher Curl Machine",
            "Reverse Curl"
    
        ];
        const filtered = choices.filter(choice => choice.toLowerCase().indexOf(focused.toLowerCase()) >= 0);
        interaction.respond(
            filtered.slice(0,24).map(choice => ({name: choice, value: choice}))
        );
    }

    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === "help"){

    }
})

client.login(process.env.TOKEN);
//client.login("MTE5NTg3MjI2NzE1MDgzNTgzNQ.GewRlR.o1mK7pxufXiXSi3HKGFjmmkFo_pBtgz4EeBQdk");