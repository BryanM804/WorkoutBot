const Account = require(".\\Account.js");
const { HelpEmbed } = require("..\\utils\\Embeds.js");
const { ExerciseList } = require("..\\utils\\Exercises.js");
const {Client, IntentsBitField, AutocompleteInteraction, CommandInteractionOptionResolver, User, ActivityType, EmbedBuilder} = require("discord.js");
const fs = require("fs");
require("dotenv").config();

//To do list:
//cardio command

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
                accounts.push(new Account(JSON.parse(data).name, JSON.parse(data).id, JSON.parse(data).bodyweight, JSON.parse(data).level, JSON.parse(data).xp, JSON.parse(data).creationDate, JSON.parse(data).skipTotal, JSON.parse(data).skipStreak, JSON.parse(data).restDays, JSON.parse(data).squat, JSON.parse(data).bench, JSON.parse(data).deadlift, JSON.parse(data).history))
            }catch(error){
                console.error(error)
                console.log(`File was corrupted, attempting to restore backup.`)
                fs.readFile(`backup\\${files[i]}`, "utf-8", (err2, backupData) =>{
                    if(err2){
                        console.error(err2);
                        process.exit();
                    }
                    try{
                        accounts.push(new Account(JSON.parse(backupData).name, JSON.parse(backupData).id, JSON.parse(backupData).bodyweight, JSON.parse(backupData).level, JSON.parse(backupData).xp, JSON.parse(backupData).creationDate, JSON.parse(backupData).skipTotal, JSON.parse(backupData).skipStreak, JSON.parse(backupData).restDays, JSON.parse(backupData).squat, JSON.parse(backupData).bench, JSON.parse(backupData).deadlift, JSON.parse(backupData).history))
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
                    console.log(`${accounts[i].getName()} Skipped.`)
                    accounts[i].skipDay();
                }
            }
        }
    }
}

function makeBackup(){
    for(let i = 0; i < accounts.length; i++){
        accounts[i].writeInfo();
        fs.readdir("accounts", (err, files) => {
            if(err)
                console.error(err);
            fs.copyFile(`accounts\\${files[i]}`, `backup\\${files[i]}`, (cpyErr) => {if(cpyErr) console.error(cpyErr)});
        });
    }
    console.log(`Backup successful on ${new Date().toDateString()} at ${new Date().toTimeString()}`);
}

//Returns the Account from the array of accounts that matches the name and id
function findAccount(name, id){
    for(let i = 0; i < accounts.length; i++){
        if(accounts[i].getId() === id){
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
            accounts.sort((a, b) => {
                if(a.getLevel() == b.getLevel()){
                    return b.getXp() - a.getXp();
                }else{
                    return b.getLevel() - a.getLevel();
                }
            });
            break;
        case "Days Skipped":
            accounts.sort((a, b) => {
                return b.getSkipTotal() - a.getSkipTotal();
            });
            break;
        case "Skip Streak":
            accounts.sort((a, b) => {
                return b.getSkipStreak() - a.getSkipStreak();
            });
            break;
        case "Days Logged":
            accounts.sort((a, b) => {
                return b.getTotalDays() - a.getTotalDays();
            });
            break;
        case "Cardio Total":
            accounts.sort((a, b) => {
                return b.getLevel() - a.getLevel(); //Change to cardio later
            });
            break;
        case "Date Created":
            accounts.sort((a, b) => {
                return Date.parse(a.getCreationDate()) - Date.parse(b.getCreationDate());
            });
            break;
        case "Squat":
            accounts.sort((a, b) => {
                return b.getSquat() - a.getSquat();
            });
            break;
        case "Bench":
            accounts.sort((a, b) => {
                return b.getBench() - a.getBench();
            });
            break;
        case "Deadlift":
            accounts.sort((a, b) => {
                return b.getDeadlift() - a.getDeadlift();
            });
            break;
        case "Powerlifting Total":
            accounts.sort((a, b) => {
                return b.getTotal() - a.getTotal();
            });
            break;
    }
}

try{
    client.on("ready", (c) => {
        setInterval(makeBackup, 3600000);//Backup every 1 hour
        setInterval(checkSkips, 900000);//Checks every 15 minutes
        makeBackup();
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
            const choices = ExerciseList;
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
            if(weight > 2000 || reps > 100 || sets > 50 || weight < 0 || reps < 0 || sets <= 0){
                interaction.reply("Invalid input.");
            }else{
                console.log(`${interaction.user.username} Logged: ${movement} ${weight} lbs, ${reps} reps, and ${sets} sets.`)
                let tempAccount = findAccount(interaction.user.username, interaction.user.id)
                let prevLvl = tempAccount.getLevel();
                for(let i = 0; i < sets; i++){
                    //findAccount("leeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "426930071459332096").logSet(movement, weight, reps)
                    tempAccount.logSet(movement, weight, reps);
                }
                if(tempAccount.getLevel() > prevLvl){
                    interaction.channel.send(`${interaction.user} has leveled up to level ${tempAccount.getLevel()}!`)
                }
                //Reply in chat (will likely change to an embed later)
                if(sets > 1){
                    interaction.reply(`Logged ${sets} sets of ${movement} ${weight}lbs for ${reps} reps.`);
                }else if(weight >= 1){
                    interaction.reply(`Logged ${movement} ${weight}lbs for ${reps} reps.`);
                }else{
                    interaction.reply(`Logged ${movement} for ${reps} reps.`);
                }
            }
        }

        //Cardio command handling
        if(interaction.commandName === "cardio"){

        }

        //History command handling
        if(interaction.commandName === "history"){
            let days = interaction.options.get("days")?.value ?? 1;
            let startDate = interaction.options.get("date")?.value ?? null;
            if(days <= 0){
                interaction.reply("Invalid number of days.")
            }else{
                //interaction.reply(findAccount(interaction.user.username, interaction.user.id).getHistoryString(days));
                let historyEmbeds = findAccount(interaction.user.username, interaction.user.id).getHistoryEmbeds(days, startDate);
                console.log(`${interaction.user.username} fetched ${days} days of history from ${new Date(Date.parse(startDate)).toDateString()}`)
                interaction.reply({embeds: historyEmbeds});
            }
        }

        //Profile command handling
        if(interaction.commandName === "profile"){
            const otherUser = interaction.options.get("user")?.user ?? null;
            if(otherUser != null){
                //interaction.reply(findAccount(otherUser.username, otherUser.id).toString());
                //This command checks if a user has a profile or not since I want the creation date to reflect when that user actually started using the app.
                let exists = false;
                for(let i = 0; i < accounts.length; i++){
                    if(accounts[i].getId() == otherUser.id)
                        exists = true;
                }
                if(exists)
                    interaction.reply({ embeds: [findAccount(otherUser.username, otherUser.id).getProfileEmbed(otherUser)] });
                else
                    interaction.reply(`${otherUser.displayName} has no profile.`);
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
                    console.log(`${interaction.user.username} removed ${chosenDay} from rest days.`)
                    removed = true;
                    break;
                }
            }
            if(!removed){
                currentDays.push(interaction.options.get("day").value)
                userAccount.setRestDays(currentDays);
                interaction.reply(`Added ${chosenDay} to your rest days.`);
                console.log(`${interaction.user.username} added ${chosenDay} to rest days.`)
            }
        }

        //Bodyweight, Squat, Bench, Deadlift command handling
        if(interaction.commandName === "bodyweight" || interaction.commandName === "squat" || interaction.commandName === "bench" || interaction.commandName === "deadlift"){
            let weight = interaction.options.get("weight").value;
            let type = interaction.commandName;
            if(weight <= 0 || weight > 1000){
                interaction.reply("Invalid weight.")
            }else{
                switch(type){
                    case "bodyweight":
                        findAccount(interaction.user.username, interaction.user.id).setBodyweight(weight);
                        break;
                    case "squat":
                        findAccount(interaction.user.username, interaction.user.id).setSquat(weight);
                        break;
                    case "bench":
                        findAccount(interaction.user.username, interaction.user.id).setBench(weight);
                        break;
                    case "deadlift":
                        findAccount(interaction.user.username, interaction.user.id).setDeadlift(weight);
                        break;
                }
                interaction.reply(`Set your ${type} to ${weight}lbs.`);
                console.log(`${interaction.user.username} set ${type} to ${weight}lbs.`)
            }
        }

        //Stats command handling
        if(interaction.commandName === "stats"){
            interaction.reply({ embeds: [findAccount(interaction.user.username, interaction.user.id).getStats(interaction.options.get("movement").value)] });
        }

        //Label command handling
        if(interaction.commandName === "label"){
            let userAccount = findAccount(interaction.user.username, interaction.user.id);
            if(userAccount.setDayLabel(interaction.options.get("label").value)){
                interaction.reply(`Set today's label to: ${interaction.options.get("label").value}`);
                console.log(`${interaction.user.username} set today's label to ${interaction.options.get("label").value}`)
            }else{
                interaction.reply("No log for today, nothing to label.");
            }
        }

        //Undo command handling
        if(interaction.commandName === "undo"){
            let userAccount = findAccount(interaction.user.username, interaction.user.id);
            let removeSets = interaction.options.get("sets")?.value ?? 1;
            if(userAccount.undoSet(removeSets)){
                if(removeSets > 1)
                    interaction.reply(`Successfully undid ${removeSets} sets`);
                else
                    interaction.reply("Successfully undid set.");
                console.log(`${interaction.user.username} undid ${removeSets} sets.`)
            }else{
                interaction.reply("No logged sets left to undo today.");
            }
        }

        //Leaderboard command Handling
        if(interaction.commandName === "leaderboard"){
            let leaderBoardEmbed = new EmbedBuilder()
            .setTitle(`Leaderboard`)
            .setDescription(`Sorted by ${interaction.options.get("stat").value}`);
            sortAccounts(interaction.options.get("stat").value);
            let number = 0;
            for(let i = 0; i < accounts.length; i++){
                if(accounts[i].getName() == "lemonrofl"){
                    continue;
                }
                number++;
                switch(interaction.options.get("stat").value){
                    case "Level":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Level: ${accounts[i].getLevel()}` });
                        break;
                    case "Days Skipped":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Days Skipped: ${accounts[i].getSkipTotal()}` });
                        break;
                    case "Skip Streak":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Skip Streak: ${accounts[i].getSkipStreak()}` });
                        break;
                    case "Days Logged":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Days Logged: ${accounts[i].getTotalDays()}` });
                        break;
                    case "Cardio Total":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Cardio Total: ${accounts[i].getName()} minutes` });
                        break;
                    case "Date Created":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Date Created: ${accounts[i].getCreationDate()}` });
                        break;
                    case "Squat":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Squat: ${accounts[i].getSquat()}` });
                        break;
                    case "Bench":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Bench: ${accounts[i].getBench()}` });
                        break;
                    case "Deadlift":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Deadlift: ${accounts[i].getDeadlift()}` });
                        break;
                    case "Powerlifting Total":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].getName()}`, value: `Total: ${accounts[i].getTotal()}` });
                        break;
                }
            }
            interaction.reply({ embeds: [leaderBoardEmbed] }); //THIS WILL BREAK, when there are more than 25 users. I'll fix it later
        }


    })
} catch(interactionError){
    console.error(interactionError);
}
client.login(process.env.TOKEN);