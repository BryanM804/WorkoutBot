const Account = require(".\\Account.js");
const { HelpEmbed } = require("./utils/Embeds.js");
const { Client, IntentsBitField } = require("discord.js");
const fs = require("fs");
const eventHandler = require(".\\handlers\\eventHandler");
const getAllFiles = require(".\\utils\\getAllFiles.js")
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

eventHandler(client);

//Ensuring there is a backup directory to backup accounts.
if (!fs.readdirSync("backup")) {
    console.log(`ERROR: ${err}\nMaking new backup directory.`)
    fs.mkdirSync("backup");
}

//Creating account objects for each user file when the bot starts
let accounts = []

const files = fs.readdirSync("accounts");
if (!files) {
    console.log(`ERROR: ${err}\nMaking new accounts directory.`)
    fs.mkdirSync("accounts");
}

for (let i = 0; i < files.length; i++) {
    const data = fs.readFileSync(`accounts\\${files[i]}`);

    try {
        accounts.push(new Account(JSON.parse(data).name, JSON.parse(data).id, JSON.parse(data).bodyweight, JSON.parse(data).level, JSON.parse(data).xp, JSON.parse(data).creationDate, JSON.parse(data).skipTotal, JSON.parse(data).skipStreak, JSON.parse(data).restDays, JSON.parse(data).squat, JSON.parse(data).bench, JSON.parse(data).deadlift, JSON.parse(data).history))
    } catch (error) {
        console.error(error)
        console.log(`File was corrupted, attempting to restore backup.`);
        
        const backupData = fs.readFileSync(`backup\\${files[i]}`);

        try {
            accounts.push(new Account(JSON.parse(backupData).name, JSON.parse(backupData).id, JSON.parse(backupData).bodyweight, JSON.parse(backupData).level, JSON.parse(backupData).xp, JSON.parse(backupData).creationDate, JSON.parse(backupData).skipTotal, JSON.parse(backupData).skipStreak, JSON.parse(backupData).restDays, JSON.parse(backupData).squat, JSON.parse(backupData).bench, JSON.parse(backupData).deadlift, JSON.parse(backupData).history))
        } catch (error2){
            console.log(`ERROR: Backup was unreadable.`);
            console.error(error2);
            process.exit();
        }
    }
}

//Checking if Users skipped a day
function checkSkips(){
    if (new Date().getHours() >= 23) {
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].getHistory().length < 1) continue;

            const lastWorkout = new Date(accounts[i].getHistory()[accounts[i].getHistory().length - 1].getDate());
            let daysSkipped = 0;
            let tempDate = new Date(Date.parse(new Date().toDateString())); //Removing the ms from the date (possibly very foolish)

            while (parseInt((tempDate.getTime() - lastWorkout.getTime()) / 86400000) != 0) {
                restDay = false;

                for (let j = 0; j < accounts[i].getRestDays().length; j++) {
                    if(tempDate.getDay() == accounts[i].getRestDays()[j]){
                        restDay = true;
                    }
                }

                tempDate.setTime(tempDate.getTime() - 86400000);

                if(!restDay) daysSkipped++;
            }

            if (daysSkipped > 0) {
                while (accounts[i].getSkipStreak() != daysSkipped) {
                    console.log(`${accounts[i].getName()} Skipped.`)
                    accounts[i].skipDay();
                }
            }
        }
    }
}

// Makes a backup file for each account file
function makeBackup(){
    for (let i = 0; i < accounts.length; i++) {
        accounts[i].writeInfo();
    }

    fs.readdir("accounts", (err, files) => {
        for (const file of files) {
            if(err)
                console.error(err);

            let currentSize, backupSize;
            let currentFile, backupFile;

            currentFile = fs.openSync(`accounts\\${file}`);
            if (fs.existsSync(`backup\\${file}`)) {
                backupFile = fs.openSync(`backup\\${file}`);
            }
            
            if (currentFile) {
                currentSize = fs.fstatSync(currentFile).size;
                fs.closeSync(currentFile);
            }
            if (backupFile) {
                backupSize = fs.fstatSync(backupFile).size;
                fs.closeSync(backupFile);
            }

            if (currentSize < backupSize) {
                console.log(`Corrupt main file detected, skipping backup for ${file}`);
            } else {
                fs.copyFile(`accounts\\${file}`, `backup\\${file}`, (cpyErr) => {if(cpyErr) console.error(cpyErr)});
            }
        }
    });
    console.log(`Backup successful on ${new Date().toDateString()} at ${new Date().toTimeString()}`);
}

// Clears the folder of generated graphs
function clearGraphs() {
    const graphs = getAllFiles(".\\src\\graphs");
    if (graphs.length <= 0) return;

    for (const graph of graphs) {
        fs.rmSync(graph);
    }
}

//Returns the Account from the array of accounts that matches the name and id
const findAccount = function(name, id, createNew = true){
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].getId() === id) {
            return accounts[i];
        }
    }
    if (createNew) {
        accounts.push(new Account(name, id));
        console.log(`Created new account for ${name}`);
        return accounts[accounts.length - 1];
    } else {
        return null;
    }
}

//Sorts accounts array by the type specified
const sortAccounts = function(sortby) {
    switch (sortby) {
        case "Level":
            accounts.sort((a, b) => {
                if (a.getLevel() == b.getLevel()) {
                    return b.getXp() - a.getXp();
                } else {
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

    return accounts;
}

try {
    client.on("ready", (c) => {
        setInterval(makeBackup, 14400000);//Backup every 4 hours
        setInterval(checkSkips, 900000);//Checks every 15 minutes
        makeBackup();
        checkSkips();
        clearGraphs();
    });
} catch (interactionError) {
    console.error(interactionError);
}

module.exports = { findAccount, sortAccounts };
client.login(process.env.TOKEN);