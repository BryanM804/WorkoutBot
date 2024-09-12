const fs = require("fs");
const sql = require("mysql2");
const { EmbedBuilder } = require("discord.js");
const WorkoutDay = require("./WorkoutDay.js");
const Set = require("./Set.js");
const createConnection = require("./createConnection.js");
const con = createConnection();

class Account{
    constructor(name, id){
        this.name = name;
        this.id = id;
        this.getStatsFromDB(false);
    }

    getStatsFromDB(logInfo = false, callback) {
        con.connect((err) => {
            if (err) console.log(`Connection error getting stats: ${err}`);

            con.query(`SELECT * FROM accounts WHERE id = '${this.id}'`, (err2, result) => {
                if (err2) console.log(`Query error getting stats: ${err2}`);
                if (result.length > 0) {
                    const profile = result[0];
                    this.bodyweight = profile.bodyweight;
                    this.level = profile.level;
                    this.xp = profile.xp;
                    this.creationDate = profile.creationdate;
                    this.skipTotal = profile.skiptotal;
                    this.skipStreak = profile.skipstreak;
                    this.restDays = profile.restdays ? profile.restdays.split(" ") : [];
                    this.squat = profile.squat;
                    this.bench = profile.bench;
                    this.deadlift = profile.deadlift;

                    if (this.restDays.length > 0) this.restDays.pop(); // Split leaves a '' in the array

                    if (callback) callback(true);
                } else {
                    // Make a new account in the db
                    con.query(`INSERT INTO accounts (id, name, bodyweight, level, xp, creationDate, skiptotal, skipstreak, squat, bench, deadlift) VALUES (
                        '${this.id}', '${this.name}', 0, 1, 0, '${new Date().toDateString()}', 0, 0, 0, 0, 0)`, (err2, result) => {
                            if (err2) console.log(`Query error creating account: ${err2}`);
                            if (callback) callback(false);
                        })
                }
                if (logInfo) console.log(result[0]);
            });
        })
    }

    writeStatsToDB(logInfo = false, callback) {
        con.connect((err) => {
            if (err) console.log(`Connection error: ${err}`);

            let restDaysString = "";
            for (let i = 0; i < this.restDays.length; i++) {
                restDaysString += parseInt(this.restDays[i]) + " ";
            }

            con.query(`UPDATE accounts SET 
            bodyweight = ${this.bodyweight},
            level = ${this.level},
            xp = ${this.xp},
            skiptotal = ${this.skipTotal},
            skipstreak = ${this.skipStreak},
            restdays = '${restDaysString}',
            squat = ${this.squat},
            bench = ${this.bench},
            deadlift = ${this.deadlift}
            WHERE id = '${this.id}'`, 
            (err2, result) => {
                if (err2) console.log(`Query error: ${err2}`);
                if (logInfo) console.log(result);
            }, (err3, result) => {
                if (err3) console.log(`Error updating accounts: ${err3}`);
                if (callback) callback();
            })
        })
    }

    logSet(movement, weight, reps, date, callback){
        let today;
        let time = new Date().toLocaleTimeString("en-US");

        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }
        
        this.xp += Set.getXPAmount(movement, weight, reps, this.bodyweight);

        con.connect((err) => {
            if (err) console.log(`Connection error: ${err}`);
            con.query(`INSERT INTO lifts (userID, movement, weight, reps, date, settotal, dateval, time) VALUES (
                '${this.id}',
                '${movement}',
                ${weight},
                ${reps},
                '${today}',
                ${Set.getSetTotal(movement, weight, reps, this.bodyweight)},
                ${Date.parse(today)},
                '${time}'
            )`, (err2, results) => {
                // This should throw an error or else the accounts and lifts tables will desync (ask me how I know)
                if (err2) {
                    console.log(`Error inserting new set`);
                    throw err2;
                }

                // Level up loop
                while (this.xp >= this.level * 1500) {
                    this.xp -= (this.level * 1500);
                    this.level++;
                    console.log(`${this.name} leveled up to ${this.level}`);
                }

                this.skipStreak = 0;
                this.writeStatsToDB();
                if (callback) callback();
            });
        });
    }

    
    repeatSet(weight, reps, repeats, callback){
        let repeatWeight, repeatReps;

        con.connect((err) => {
            if (err) console.log(`Connection error in repeat set: ${err}`);
            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' ORDER BY dateval DESC, setid DESC;`, (err2, sets) => {
                if (err2) console.log(`Querying error in repeat set: ${err2}`);

                if (sets.length > 0) {
                    const lastSet = new Set(sets[0].movement, sets[0].weight, sets[0].reps, this.bodyweight);
                    repeatWeight = weight ? weight : lastSet.weight;
                    repeatReps = reps ? reps : lastSet.reps;

                    for (let i = 0; i < repeats - 1; i++) {
                        this.logSet(lastSet.movement, repeatWeight, repeatReps, sets[0].date);
                    }

                    // I want the callback for the last one.
                    this.logSet(lastSet.movement, repeatWeight, repeatReps, sets[0].date, () => {
                        if (callback) callback(new Set(lastSet.movement, repeatWeight, repeatReps, this.bodyweight));
                    });
                } else {
                    if (callback) callback(false);
                }
            });
        });
    }

    logCardio(movement, time, date, note, distance, callback) {
        let today;
        let localTime = new Date().toLocaleTimeString("en-US");

        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }

        con.connect((err) => {
            if (err) console.log(`Connection error logging cardio: ${err}`);
            
            con.query(`INSERT INTO cardio (userid, movement, cardiotime, date, time, note, distance) VALUES (
                '${this.id}',
                '${movement}',
                ${time},
                '${today}',
                '${localTime}',
                '${note}',
                '${distance}'
            )`, (err2, results) => {
                if (err2) {
                    console.log(`Error inserting cardio: ${err2}`);
                    throw err2;
                }

                this.xp += (25 * time) + 100;

                // Level up loop
                while (this.xp >= this.level * 1500) {
                    this.xp -= (this.level * 1500);
                    this.level++;
                    console.log(`${this.name} leveled up to ${this.level}`);
                }
                
                this.writeStatsToDB();
                if (callback) callback()
            });
        });
    }

    getBreakdown(date, callback) {
        let today;
        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }

        con.connect((err) => {
            if (err) console.log(`Connection error getting sets breakdown: ${err}`);
            
            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND date = '${today}';`, (err2, results) => {
                if (err2) console.log(`Error getting sets for breakdown:\n ${err2}`);

                con.query(`SELECT * FROM exercises;`, (err3, movements) => {
                    if (err3) console.log(`Error getting movements for breakdown:\n ${err3}`)

                    let groups = []
                    let counts = []

                    for (const set of results) {
                        const movement = set.movement;
                        for (const inclMovement of movements) {
                            if (movement == inclMovement.movement) {
                                let has = false;
                                // console.log(`${movement} == ${inclMovement}, ${inclMovement.mgroup}`);

                                for (let i = 0; i < groups.length; i++) {
                                    if (groups[i] == inclMovement.mgroup) {
                                        counts[i]++;
                                        has = true;
                                        break;
                                    }
                                }

                                if (!has) {
                                    groups.push(inclMovement.mgroup);
                                    counts.push(1);
                                }
                            }
                        }
                    }

                    let breakdownStr = ``;
                    for (let i = 0; i < groups.length; i++) {
                        breakdownStr += `${groups[i]}: ${counts[i]} sets\n`
                    }

                    if (callback) callback(breakdownStr)
                })
            })
        })
    }

    getCardio(date, callback) {
        let today;
        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }

        con.connect((err) => {
            if (err) console.log(`Connection error getting sets breakdown: ${err}`);
            
            con.query(`SELECT * FROM cardio WHERE userid = '${this.id}' AND date = '${today}';`, (err2, results) => {
                if (err2) console.log(`Error getting sets for breakdown:\n ${err2}`);

                let cardioStr = ``;

                for (const cardioSet of results) {
                    if (cardioSet.note == "" && cardioSet.distance == "0.0")
                        cardioStr += `${cardioSet.movement} for ${cardioSet.cardiotime} minutes\n`;
                    else if (cardioSet.note == "")
                        cardioStr += `${cardioSet.movement} for ${cardioSet.cardiotime} minutes and ${cardioSet.distance} miles\n`;
                    else if (cardioSet.distance == "0.0")
                        cardioStr += `${cardioSet.movement} for ${cardioSet.cardiotime} minutes\n- ${cardioSet.note}\n`;
                    else
                        cardioStr += `${cardioSet.movement} for ${cardioSet.cardiotime} minutes and ${cardioSet.distance} miles\n- ${cardioSet.note}\n`;
                }

                if (callback) callback(cardioStr);
            })
        })
    }

    skipDay(){
        this.skipTotal++;
        this.skipStreak++;
        this.writeStatsToDB();
    }

    undoSet(sets, callback){

        let removeSets = sets || 1;
        if(removeSets <= 0) removeSets = 1;

        con.connect((err) => {
            if (err) console.log(`Connection error: ${err}`);
            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' ORDER BY dateval DESC, setid DESC;`, (err2, results) => {
                if (err2) console.log(`Query error undoing set: ${err2}`);
                if (results.length == 0) {
                    if (callback) callback(false);
                    return;
                }

                removeSets = removeSets > results.length ? results.length : removeSets;

                for (let i = 0; i < removeSets; i++) {
                    let set = results[i];

                    con.query(`DELETE FROM lifts WHERE setid = ${set.setid};`, (err3, delResult) => {
                        if (err3) console.log(`Deletion error undoing set: ${err3}`);

                        this.xp -= Set.getXPAmount(set.movement, set.weight, set.reps, this.bodyweight);

                        while (this.xp < 0) {
                            this.level--;
                            this.xp += this.level * 1500;
                        }

                        this.writeStatsToDB();
                    });
                }
                if (callback) callback(true);
            });
        });
    }

    getTotalDays(callback){
        con.connect((err) => {
            if (err) console.log(`Connection error getting total days: ${err}`);
            con.query(`SELECT DISTINCT date FROM lifts WHERE userID = '${this.id}' ORDER BY date;`, (err2, allDates) => {
                if (allDates.length < 1) {
                    this.totalDays = 0;
                    return;
                }

                this.totalDays = allDates.length; // This method would always be called before this needs to be displayed
                if (callback) callback(allDates.length);
            });
        });
    }

    getTotal(){
        return this.squat + this.bench + this.deadlift;
    }

    setBodyweight(newBodyweight){
        this.bodyweight = newBodyweight;
        this.writeStatsToDB();
    }
    setRestDays(newRestDays){
        this.restDays = newRestDays;
        this.writeStatsToDB();
    }
    setSquat(newSquat){
        this.squat = newSquat;
        this.writeStatsToDB();
    }
    setBench(newBench){
        this.bench = newBench;
        this.writeStatsToDB();
    }
    setDeadlift(newDeadlift){
        this.deadlift = newDeadlift;
        this.writeStatsToDB();
    }
}

module.exports = Account