const Account = require(".\\Account.js");
const {Client, IntentsBitField, AutocompleteInteraction, CommandInteractionOptionResolver} = require('discord.js');
const fs = require("fs");
require("dotenv").config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        ],
});

//Creating account objects for each user file when the bot starts
let accounts = []
fs.readdir("accounts", (err, files) => {
    if(err){
        console.log(`ERROR: ${err}\nMaking new dir.`)
        fs.mkdir("accounts", (error) => {console.error(error)})
    }
    for(let i = 0; i < files.length; i++){
        fs.readFile(`accounts\\${files[i]}`, "utf-8", (err, data) => {
            if(err)
                console.error(err);
            //When I figure out a more efficient way to convert from JSON to an Account object it will go here
            accounts.push(new Account(JSON.parse(data).name, JSON.parse(data).id, JSON.parse(data).level, JSON.parse(data).xp, JSON.parse(data).creationDate, JSON.parse(data).skipTotal, JSON.parse(data).skipStreak, JSON.parse(data).history))
        })
    }
})

function findAccount(name, id){
    for(let i = 0; i < accounts.length; i++){
        if(accounts[i].id === id){
            return accounts[i];
        }
    }
    accounts.push(new Account(name, id));
    console.log(`Created new account for ${name}`);
    return accounts[accounts.length - 1];
}

client.on("ready", (c) => {
    console.log(`${c.user.tag} is ready for gains.`);
});

//Ideally in the future this will be handled with a command handler
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
        console.log(interaction);
    }
    
    if(interaction.commandName === "log"){
        var movement = interaction.options.get("movement").value;
        var weight = interaction.options.get("weight")?.value ?? 0;
        var reps = interaction.options.get("reps")?.value ?? 0;
        var sets = interaction.options.get("sets")?.value ?? 1;
        console.log(`${interaction.user.username} Logged: ${movement} ${weight} lbs, ${reps} reps, and ${sets} sets.`)
        for(let i = 0; i < sets; i++){
            tempAccount = findAccount(interaction.user.username, interaction.user.id)
            tempAccount.logSet(movement, weight, reps);
        }

        //Reply in chat (will likely change to an embed later)
        if(sets > 1){
            interaction.reply(`Logged ${sets} sets of ${movement} ${weight}lbs for ${reps} reps.`)
        }else{
            interaction.reply(`Logged ${movement} ${weight}lbs for ${reps} reps.`)
        }
    }
})

client.login(process.env.TOKEN);
//client.login("MTE5NTg3MjI2NzE1MDgzNTgzNQ.GewRlR.o1mK7pxufXiXSi3HKGFjmmkFo_pBtgz4EeBQdk");