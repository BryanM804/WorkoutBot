const Account = require(".\\Account.js");
const { HelpEmbed } = require("./utils/Embeds.js");
const { Client, IntentsBitField } = require("discord.js");
const fs = require("fs");
const sql = require("mysql2");
const eventHandler = require(".\\handlers\\eventHandler");
const getAllFiles = require(".\\utils\\getAllFiles.js")
const createConnection = require(".\\createConnection.js");
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

// Establish a connection to the sql database
const con = createConnection(); // gitignored so you don't see my password :P

//Creating account objects for each user file when the bot starts
let accounts = []

// In large scale it would be very inefficient to have every account loaded to memory.
// However in its current state this project is meant to be a private bot for my friends only.
con.connect((err) => {
    if (err) {
        console.error(err);
    } else {
        con.query(`SELECT * FROM accounts`, (err2, result) => {
            if (err2) console.error(err2);
            for (const acc of result) {
                accounts.push(new Account(acc.name, acc.id));
            }
        });
    }
});

// TO BE REWRITTEN
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
        if (accounts[i].id === id) {
            return accounts[i];
        }
    }
    if (createNew) { // Create new wont work properly for the time being
        accounts.push(new Account(name, id));
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
                if (a.level == b.level) {
                    return b.xp - a.xp;
                } else {
                    return b.level - a.level;
                }
            });
            break;
        case "Days Skipped":
            accounts.sort((a, b) => {
                return b.skipTotal - a.skipTotal;
            });
            break;
        case "Skip Streak":
            accounts.sort((a, b) => {
                return b.skipStreak - a.skipStreak;
            });
            break;
        case "Days Logged":
            accounts.sort((a, b) => {
                return b.getTotalDays() - a.getTotalDays();
            });
            break;
        case "Cardio Total":
            accounts.sort((a, b) => {
                return b.level - a.level; //Change to cardio later
            });
            break;
        case "Date Created":
            accounts.sort((a, b) => {
                return Date.parse(a.creationDate) - Date.parse(b.creationDate);
            });
            break;
        case "Squat":
            accounts.sort((a, b) => {
                return b.squat - a.squat;
            });
            break;
        case "Bench":
            accounts.sort((a, b) => {
                return b.bench - a.bench;
            });
            break;
        case "Deadlift":
            accounts.sort((a, b) => {
                return b.deadlift - a.deadlift;
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
        //setInterval(makeBackup, 14400000);//Backup every 4 hours
        //setInterval(checkSkips, 900000);//Checks every 15 minutes
        //makeBackup();
        //checkSkips();
        clearGraphs();
    });
} catch (interactionError) {
    console.error(interactionError);
}

module.exports = { findAccount, sortAccounts };
client.login(process.env.TOKEN);