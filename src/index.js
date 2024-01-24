const Account = require(".\\Account.js");
const { HelpEmbed } = require(".\\Embeds.js")
const {Client, IntentsBitField, AutocompleteInteraction, CommandInteractionOptionResolver, User, ActivityType, EmbedBuilder} = require("discord.js");
const fs = require("fs");
require("dotenv").config();

//To do list:
//Make embeds for things
//cardio command
//stats for sets

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        ],
});

//Ensuring there is a backup directory to backup accounts.
fs.readdir("backup", (err, files) => {
    if(err){
        console.log(`ERROR: ${err}\nMaking new backup directory.`)
        fs.mkdir("backup", (error) => {console.error(error)})
    }
});

//Creating account objects for each user file when the bot starts and backing them up in case
//the program crashes
let accounts = []
fs.readdir("accounts", (err, files) => {
    if(err){
        console.log(`ERROR: ${err}\nMaking new accounts directory.`)
        fs.mkdir("accounts", (error) => {console.error(error)})
    }
    for(let i = 0; i < files.length; i++){
        fs.readFile(`accounts\\${files[i]}`, "utf-8", (err, data) => {
            if(err)
                console.error(err);
            //When I figure out a more efficient way to convert from JSON to an Account object it will go here
            //If the program crahses the account file will be empty, this checks for that and restores the backups
            try{
                accounts.push(new Account(JSON.parse(data).name, JSON.parse(data).id, JSON.parse(data).level, JSON.parse(data).xp, JSON.parse(data).creationDate, JSON.parse(data).skipTotal, JSON.parse(data).skipStreak, JSON.parse(data).restDays, JSON.parse(data).history))
            }catch(error){
                console.error(error)
                console.log(`File was corrupted, attempting to restore backup.`)
                fs.readFile(`backup\\${files[i]}`, "utf-8", (err2, backupData) =>{
                    if(err2){
                        console.error(err2);
                        process.exit();
                    }
                    try{
                        accounts.push(new Account(JSON.parse(backupData).name, JSON.parse(backupData).id, JSON.parse(backupData).level, JSON.parse(backupData).xp, JSON.parse(backupData).creationDate, JSON.parse(backupData).skipTotal, JSON.parse(backupData).skipStreak, JSON.parse(backupData).restDays, JSON.parse(backupData).history))
                    }catch(error2){
                        console.log(`ERROR: Backup was unreadable.`);
                        console.error(error2);
                        process.exit();
                    }
                });
            }
        })
    }
})

//Checking if Users skipped a day
function checkSkips(){
    if(new Date().getHours() >= 23){
        for(let i = 0; i < accounts.length; i++){
            if(accounts[i].getHistory().length < 1)
                continue;

            const lastWorkout = new Date(accounts[i].getHistory()[accounts[i].getHistory().length - 1].getDate());
            let daysSkipped = 0;
            let tempDate = new Date(Date.parse(new Date().toDateString())); //Removing the ms from the date (possibly very foolish)
            while(parseInt((tempDate.getTime() - lastWorkout.getTime()) / 86400000) != 0){
                restDay = false;
                for(let j = 0; j < accounts[i].getRestDays().length; j++){
                    if(tempDate.getDay() == accounts[i].getRestDays()[j]){
                        restDay = true;
                    }
                }
                tempDate.setTime(tempDate.getTime() - 86400000);
                if(!restDay)
                    daysSkipped++;
            }

            if(daysSkipped > 0){
                while(accounts[i].getSkipStreak() != daysSkipped){
                    accounts[i].skipDay();
                }
            }
        }
    }
}

//Returns the Account from the array of accounts that matches the name and id
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

//Sorts the accounts array by the type specified
function sortAccounts(sortby){
    switch(sortby){
        case "Level":
            
            break;
        case "Days Skipped":
            
            break;
        case "Skip Streak":
            
            break;
        case "Days Logged":
            
            break;
        case "Cardio Total":
            
            break;
        case "Date Created":
            
            break;
    }
}

client.on("ready", (c) => {
    for(let i = 0; i < accounts.length; i++){
        fs.readdir("accounts", (err, files) => {
            if(err)
                console.error(err);
            //Because the file functions are running async the backup has to be done once the bot is ready since
            //it ensures the accounts are all loaded in and it won't just make an empty backup.
            //I may change this later.
            fs.copyFile(`accounts\\${files[i]}`, `backup\\${files[i]}`, (cpyErr) => {if(cpyErr) console.error(cpyErr)});
        });
    }

    setInterval(checkSkips, 21600000);
    checkSkips();

    client.user.setActivity({
        name: "with heavy circles",
        type: ActivityType.Playing
    })
    console.log(`${c.user.tag} is ready for gains.`);
});

//Ideally in the future this will be handled with a command handler
client.on("interactionCreate", (interaction) =>{
    //Autocomplete for the giant list of exercises
    if(interaction.isAutocomplete() && (interaction.commandName === "log" || interaction.commandName === "stats")){
        const focused = interaction.options.getFocused();
        const choices = [
            "Barbell Bench Press", "Dumbbell Bench Press", "Chest Press Machine",
            "Incline Barbell Bench Press", "Incline Dumbbell Bench Press", "Incline Chest Press Machine",
            "Decline Barbell Bench Press", "Decline Dumbbell Bench Press", "Decline Chest Press Machine",
            "Dip", "Assissted Dip", "Barbell Shoulder Press/Military Press",
            "Dumbbell Shoulder Press", "Arnold Press", "Machine Shoulder Press",
            "Dumbbell Lateral Raise", "Cable Lateral Raise", "Machine Lateral Raise",
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

    //Help command handling
    if(interaction.commandName === "help"){
        interaction.reply({ embeds: [ HelpEmbed ] });
    }
    
    //Log command handling
    if(interaction.commandName === "log"){
        let movement = interaction.options.get("movement").value;
        let weight = interaction.options.get("weight")?.value ?? 0;
        let reps = interaction.options.get("reps")?.value ?? 0;
        let sets = interaction.options.get("sets")?.value ?? 1;
        console.log(`${interaction.user.username} Logged: ${movement} ${weight} lbs, ${reps} reps, and ${sets} sets.`)
        let tempAccount = findAccount(interaction.user.username, interaction.user.id)
        let prevLvl = tempAccount.getLevel();
        for(let i = 0; i < sets; i++){
            tempAccount.logSet(movement, weight, reps);
        }
        if(tempAccount.getLevel() > prevLvl){
            interaction.channel.send(`${interaction.user} has levelled up to level ${tempAccount.getLevel()}!`)
        }
        //Reply in chat (will likely change to an embed later)
        if(sets > 1){
            interaction.reply(`Logged ${sets} sets of ${movement} ${weight}lbs for ${reps} reps.`)
        }else{
            interaction.reply(`Logged ${movement} ${weight}lbs for ${reps} reps.`)
        }
    }

    //Cardio command handling
    if(interaction.commandName === "cardio"){

    }

    //History command handling
    if(interaction.commandName === "history"){
        let days = interaction.options.get("days")?.value ?? 3;
        if(days <= 0){
            interaction.reply("Invalid number of days.")
        }else{
            //interaction.reply(findAccount(interaction.user.username, interaction.user.id).getHistoryString(days));
            let historyEmbeds = findAccount(interaction.user.username, interaction.user.id).getHistoryEmbeds(days);
            interaction.reply({embeds: historyEmbeds});
        }
    }

    //Profile command handling
    if(interaction.commandName === "profile"){
        const otherUser = interaction.options.get("user")?.user ?? null;
        if(otherUser != null){
            //interaction.reply(findAccount(otherUser.username, otherUser.id).toString());
            interaction.reply({ embeds: [findAccount(otherUser.username, otherUser.id).getProfileEmbed(otherUser)] });
        }else{
            //interaction.reply(findAccount(interaction.user.username, interaction.user.id).toString());
            interaction.reply({ embeds: [findAccount(interaction.user.username, interaction.user.id).getProfileEmbed(interaction.user)] });
        }
    }

    //Rest Day command handling
    if(interaction.commandName === "restday"){
        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        let currentDays = userAccount.getRestDays();
        let chosenDay = "";
        switch(interaction.options.get("day").value){
            case 0:
                chosenDay = "Sunday";
                break;
            case 1:
                chosenDay = "Monday";
                break;
            case 2:
                chosenDay = "Tuesday";
                break;
            case 3:
                chosenDay = "Wednesday";
                break;
            case 4:
                chosenDay = "Thursday";
                break;
            case 5:
                chosenDay = "Friday";
                break;
            case 6:
                chosenDay = "Saturday";
                break;
        }
        let removed = false;
        for(let i = 0; i < currentDays.length; i++){
            if(currentDays[i] == interaction.options.get("day").value){
                currentDays.splice(i,1)
                userAccount.setRestDays(currentDays);
                interaction.reply(`Removed ${chosenDay} from your rest days.`);
                removed = true;
                break;
            }
        }
        if(!removed){
            currentDays.push(interaction.options.get("day").value)
            userAccount.setRestDays(currentDays);
            interaction.reply(`Added ${chosenDay} to your rest days.`);
        }
    }

    //Stats command handling
    if(interaction.commandName === "stats"){
        interaction.reply(findAccount(interaction.user.username, interaction.user.id).getStats(interaction.options.get("movement").value));
    }

    //Leaderboard command Handling
    if(interaction.commandName === "leaderboard"){
        let leaderBoardEmbed = new EmbedBuilder()
        .setTitle(`Leaderboard`)
        .setDescription(`Sorted by ${interaction.options.get("stat").value}`);
        for(let i = 0; i < accounts.length; i++){
            switch(interaction.options.get("stat").value){
                case "Level":
                    leaderBoardEmbed.addFields({ name: accounts[i].getName(), value: `Level: ${accounts[i].getLevel()}` });
                    break;
                case "Days Skipped":
                    leaderBoardEmbed.addFields({ name: accounts[i].getName(), value: `Days Skipped: ${accounts[i].getSkipTotal()}` });
                    break;
                case "Skip Streak":
                    leaderBoardEmbed.addFields({ name: accounts[i].getName(), value: `Skip Streak: ${accounts[i].getSkipStreak()}` });
                    break;
                case "Days Logged":
                    leaderBoardEmbed.addFields({ name: accounts[i].getName(), value: `Days Logged: ${accounts[i].getTotalDays()}` });
                    break;
                case "Cardio Total":
                    leaderBoardEmbed.addFields({ name: accounts[i].getName(), value: `Cardio Total: ${accounts[i].getName()} minutes` });
                    break;
                case "Date Created":
                    leaderBoardEmbed.addFields({ name: accounts[i].getName(), value: `Date Created: ${accounts[i].getCreationDate()}` });
                    break;
            }
        }
        interaction.reply({ embeds: [leaderBoardEmbed] });
    }


})

client.login(process.env.TOKEN);
//client.login("MTE5NTg3MjI2NzE1MDgzNTgzNQ.GewRlR.o1mK7pxufXiXSi3HKGFjmmkFo_pBtgz4EeBQdk");