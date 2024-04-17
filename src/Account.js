const fs = require("fs");
const sql = require("mysql2");
const { EmbedBuilder } = require("discord.js");
const WorkoutDay = require(".\\WorkoutDay.js");
const Set = require(".\\Set.js");
const createConnection = require(".\\createConnection.js");
const con = createConnection();

class Account{
    constructor(name, id){
        this.name = name;
        this.id = id;
        this.getStatsFromDB(true);
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
    getStats(movement, callback){
        if (movement == null) return;

        let thirtyDayAvgWeight = 0;
        let thirtyDayAvgReps = 0;
        let mostWeight = 0;
        let mostWeightDate = "";
        let mostReps = 0;
        let mostRepsDate = "";
        let bestTotal = 0;
        let bestSetDate = "";
        let bestSetWeight = 0;
        let bestSetReps = 0;
        let lifetimeCount = 0;
        let thirtyDayCount = 0;

        con.connect((err) => {
            if (err) console.log(`Connection error getting stats: ${err}`);

            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND movement = '${movement}' ORDER BY dateval DESC`, (err2, sets) => {
                if (err2) console.log(`Querying error getting stats: ${err2}`);
                if (sets.length < 1) {
                    if (callback) callback(new EmbedBuilder().setTitle(`No data logged for ${movement}`));
                    return;
                }

                sets.sort((a, b) => {
                    const aDate = Date.parse(a.date);
                    const bDate = Date.parse(b.date);
                    return aDate - bDate;
                })

                let currDate = sets[0].date;
                let dateCount = 1;

                for (let set of sets) {
                    let total = Set.getSetTotal(set.movement, set.weight, set.reps, this.bodyweight);

                    if (set.date != currDate) {
                        currDate = set.date;
                        dateCount++;
                    }

                    if (dateCount < 30) {
                        thirtyDayCount++;
                        thirtyDayAvgWeight += set.weight;
                        thirtyDayAvgReps += set.reps;
                    }

                    if (set.weight > mostWeight) {
                        mostWeight = set.weight;
                        mostWeightDate = set.date;
                    }
                    if (set.reps > mostReps) {
                        mostReps = set.reps;
                        mostRepsDate = set.date;
                    }

                    if (total > bestTotal) {
                        bestTotal = total;
                        bestSetDate = set.date;
                        bestSetWeight = set.weight;
                        bestSetReps = set.reps;
                    }
                }

                lifetimeCount = sets.length;
                thirtyDayAvgReps /= thirtyDayCount;
                thirtyDayAvgWeight /= thirtyDayCount;

                //Averages are rounded so they only display one decimal place
                let statsEmbed = new EmbedBuilder()
                .setTitle(`${this.name}'s ${movement}`)
                .addFields({ name: "\0", value: "**__30 Day__**" })
                .addFields({ name: "Average Weight", value: `${Math.round(thirtyDayAvgWeight * 10) / 10}lbs`, inline: true })
                .addFields({ name: "Average Reps", value: `${Math.round(thirtyDayAvgReps * 10) / 10}`, inline: true })
                .addFields({ name: "\0", value: "**__Records__**" })
                .addFields({ name: "Most Weight", value: `${mostWeight}lbs on ${mostWeightDate}`, inline: true })
                .addFields({ name: "Most Reps", value: `${mostReps} reps on ${mostRepsDate}`, inline: true })
                .addFields({ name: "Best Set", value: `${bestSetWeight}lbs x ${bestSetReps} reps = ${bestTotal} on ${bestSetDate}`, inline: true })
                .setFooter({ text: `Total Sets: ${lifetimeCount}\nSets recorded in the last 30 days: ${thirtyDayCount}`})

                if (callback) callback(statsEmbed);
            });
        });
    }

    // Gets the averages in data form for use in graphing
    getAverageData(exercise, callback) {

        let averages = [];
        let total = 0;
        let count = 0;

        con.connect((err) => {
            if (err) console.log(`Connection error getting avgs: ${err}`);

            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND movement = '${exercise}' ORDER BY dateval DESC`, (err2, sets) => {
                if (err2) console.log(`Querying error getting avgs: ${err2}`);

                sets.sort((a, b) => {
                    const aDate = Date.parse(a.date);
                    const bDate = Date.parse(b.date);
                    return aDate - bDate;
                });

                let currDate = sets[0].date;
                for (let set of sets) {
                    if (set.date == currDate) {
                        total += set.settotal != null ? set.settotal : Set.getSetTotal(set.movement, set.weight, set.reps, this.bodyweight);
                        count++;
                    } else {
                        let average = {
                            day: new Date(Date.parse(currDate)).toLocaleDateString(),
                            val: total / count
                        }
                        averages.push(average);

                        currDate = set.date;
                        total = set.settotal != null ? set.settotal : Set.getSetTotal(set.movement, set.weight, set.reps, this.bodyweight);
                        count = 1;
                    }
                }
                // Adding most recent average
                let average = {
                    day: new Date(Date.parse(currDate)).toLocaleDateString(),
                    val: total / count
                }
                averages.push(average);

                if (callback) callback(averages);
            });
        })
    }

    getStrengthData(exercise, callback) {
        let maxes = [];
        let max = 0;

        con.connect((err) => {
            if (err) console.log(`Connection error getting maxes: ${err}`);

            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND movement = '${exercise}' ORDER BY dateval DESC`, (err2, sets) => {
                if (err2) console.log(`Querying error getting maxes: ${err2}`);

                sets.sort((a, b) => {
                    const aDate = Date.parse(a.date);
                    const bDate = Date.parse(b.date);
                    return aDate - bDate;
                });

                let currDate = sets[0].date;
                for (let set of sets) {
                    if (set.date == currDate) {
                        let weight = set.weight;
                        if (max < weight) {
                            max = weight;
                        }
                    } else {
                        let maxTotal = {
                            day: new Date(Date.parse(currDate)).toLocaleDateString(),
                            val: max
                        }
                        maxes.push(maxTotal);

                        currDate = set.date;
                        max = set.weight;
                    }
                }
                // Adding most recent average
                let maxTotal = {
                    day: new Date(Date.parse(currDate)).toLocaleDateString(),
                    val: max
                }
                maxes.push(maxTotal);

                if (callback) callback(maxes);
            });
        })
    }

    //Returns the embed(s) for all of the sets for a given (days) starting from (startDate)
    getHistoryEmbeds(days, startDate, callback){
        let startDay;
        let callbackNum = 1;

        days = days > 7 ? 7 : days;

        if (startDate) {
            startDay = new Date(Date.parse(startDate)).toDateString();
        } else {
            startDay = new Date().toDateString();
        }

        let historyEmbeds = [];
        
        con.connect((err) => {
            if (err) console.log(`Connection error in history: ${err}`);

            for (let i = days - 1; i >= 0; i--) {
                let date = new Date(Date.parse(startDay) - (86400000 * i)).toDateString();

                con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND date = '${date}';`, (err2, results) => {
                    if (err2) console.log(`Error reading data for history: ${err2}`);

                    con.query(`SELECT * FROM labels WHERE userID = '${this.id}' AND date = '${date}' ORDER BY labelid DESC;`, (err3, labels) => {
                        if (err3) console.log(`Error querying labels for history: ${err3}`);

                        let embeds = WorkoutDay.getEmbeds(results, labels.length > 0 ? labels[0].label : null);
                        
                        if (embeds) {
                            for (let x = 0; x < embeds.length; x++) {
                                historyEmbeds.push(embeds[x]);
                            }
                        } else {
                            historyEmbeds.push(new EmbedBuilder().setTitle("No history.").setAuthor({ name: date }));
                        }
                        
                        if (callbackNum == days) {
                            if (callback) callback(historyEmbeds);
                        } else {
                            callbackNum++;
                        }
                    });
                })
            }
        });
    }

    getRestDayString(){
        let restDaysString = "";
        for (let i = 0; i < this.restDays.length; i++) {
            switch (parseInt(this.restDays[i])) {
                case 0:
                    restDaysString += "Sunday";
                    break;
                case 1:
                    restDaysString += "Monday";
                    break;
                case 2:
                    restDaysString += "Tuesday";
                    break;
                case 3:
                    restDaysString += "Wednesday";
                    break;
                case 4:
                    restDaysString += "Thursday";
                    break;
                case 5:
                    restDaysString += "Friday";
                    break;
                case 6:
                    restDaysString += "Saturday";
                    break;
            }
            if (i != this.restDays.length - 1) {
                restDaysString += ", ";
            }
        }
        if (restDaysString.length < 1) {
            restDaysString = "None"
        }
        return restDaysString;
    }

    getProfileEmbed(user, callback){
        //Needs user for the avatarURL
        this.getStatsFromDB(false, (result) => {

            let profileEmbed = new EmbedBuilder()
            .setTitle(this.name)
            .setThumbnail(user.avatarURL())
            .setFooter({ text: `Created ${this.creationDate}` })
            .addFields({ name: `Level ${this.level}`, value: `XP: ${this.xp}/${this.level * 1500}` });
            if (this.bodyweight > 0) {
                profileEmbed.addFields({ name: `Body weight:`, value: `${this.bodyweight}lbs` });
            }
            profileEmbed.addFields({ name: `Days Skipped:`, value: ` ${this.skipTotal} days`, inline: true })
            .addFields({ name: `Current Skip Streak:`, value: `${this.skipStreak} days`, inline: true })
            .addFields({ name: "Rest Days:", value: this.getRestDayString(), inline: true });
            if (this.squat > 0) {
                profileEmbed.addFields({ name: `Squat:`, value: `${this.squat}lbs`, inline: true });
            }
            if (this.bench > 0) {
                profileEmbed.addFields({ name: `Bench:`, value: `${this.bench}lbs`, inline: true });
            }
            if (this.deadlift > 0) {
                profileEmbed.addFields({ name: `Deadlift:`, value: `${this.deadlift}lbs`, inline: true });
            }

            if (callback) callback(profileEmbed);
        });
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

    setDayLabel(newLabel, callback){
        let today = new Date().toDateString();

        con.connect((err) => {
            if (err) console.log(`Connection error setting label: ${err}`);

            con.query(`INSERT INTO labels (userID, label, date) VALUES (
                '${this.id}',
                '${newLabel}',
                '${today}'
            )`, (err2, result) => {
                if (err2) console.log(`Query error setting label: ${err2}`);

                callback(true);
            })
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