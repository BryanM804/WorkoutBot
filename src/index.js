const Account = require("./Account.js");
const { Client, IntentsBitField } = require("discord.js");
const fs = require("fs");
const eventHandler = require("./handlers/eventHandler");
const getAllFiles = require("./utils/getAllFiles.js")
const pool = require("./pool.js");
require("dotenv").config();


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        ],
});

eventHandler(client);

// Creating account objects for each user file when the bot starts
let accounts = [];
let exerciseList = [];
async function loadMovements() {
    const movements = await pool.query("SELECT movement FROM exercises");    
    for (const movement of movements) {
        exerciseList.push(movement.movement);
    }
}
loadMovements();

// In large scale it would be very inefficient to have every account loaded to memory.
// However in its current state this project is meant to be a private bot for my friends only.
async function loadAccounts() {
    const result = await pool.query(`SELECT * FROM accounts`)
    for (const acc of result) {
        accounts.push(new Account(acc.name, acc.id));
    }
}
loadAccounts();

//Checking if Users skipped a day
async function checkSkips(){
    if (!(new Date().getHours() >= 23)) return;
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].currentSetNumber < 2) continue;

        const lastSet = await pool.query(`SELECT date FROM lifts WHERE userID = '${accounts[i].id}' ORDER BY dateval DESC, setid DESC;`)
        if (!lastSet[0]) return;

        const lastDate = new Date(lastSet[0].date);
        let daysSkipped = 0;
        let tempDate = new Date(Date.parse(new Date().toDateString())); // removes ms from date

        while (parseInt((tempDate.getTime() - lastDate.getTime()) / 86400000) != 0) {
            restDay = false;

            for (let j = 0; j < accounts[i].restDays.length; j++) {
                if(tempDate.getDay() == accounts[i].restDays[j]){
                    restDay = true;
                }
            }

            tempDate.setTime(tempDate.getTime() - 86400000);

            if(!restDay) daysSkipped++;
        }

        if (daysSkipped > 0) {
            while (accounts[i].skipStreak < daysSkipped) {
                console.log(`${accounts[i].name} Skipped.`)
                accounts[i].skipDay();
            }
        }
    }
}

// Clears the folder of generated graphs
function clearGraphs() {
    const graphs = getAllFiles("./src/graphs");
    if (graphs.length <= 0) return;

    for (const graph of graphs) {
        fs.rmSync(graph);
    }
}


// Returns the Account from the array of accounts that matches the name and id
const findAccount = function(name, id, createNew = true){
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id === id) {
            return accounts[i];
        }
    }
    if (createNew) { 
        accounts.push(new Account(name, id));
        return accounts[accounts.length - 1];
    } else {
        return null;
    }
}

// Sorts accounts array by the type specified
const sortAccounts = async function(sortby) {
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
            let callNum = 1;

            for (let i = 0; i < accounts.length; i++) {
                total = await accounts[i].getTotalDays()
                if (callNum == accounts.length - 1) {
                    accounts.sort((a, b) => {
                        return (b.totalDays - a.totalDays);
                    });

                    return accounts;
                } else {
                    callNum++;
                }
            }
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

    if (sortby != "Days Logged") return accounts;
}

try {
    client.on("ready", (c) => {
        clearGraphs();
    });
} catch (interactionError) {
    console.error(interactionError);
}

module.exports = { findAccount, sortAccounts, exerciseList };
client.login(process.env.TOKEN);