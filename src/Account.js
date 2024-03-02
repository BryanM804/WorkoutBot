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
        //this.bodyweight = bodyweight || 0;
        //this.level = level || 1;
        //this.xp = xp || 0;
        //this.creationDate = creationDate || new Date().toDateString();
        //this.skipTotal = skipTotal || 0;
        //this.skipStreak = skipStreak || 0;
        //this.restDays = restDays || [];
        //this.squat = squat || 0;
        //this.bench = bench || 0;
        //this.deadlift = deadlift || 0;
        //If the user has a history it converts the history it has read into WorkoutDay objects
        /*if (history != null && history.length > 0) {
            this.history = []
            for (let i = 0; i < history.length; i++) {
                this.history.push(new WorkoutDay(history[i].date, history[i].sets, history[i].label));
            }
        } else {
            this.history = [];
        }*/
        //this.file = `accounts\\${name}.json`;
        //this.writeInfo();
        this.getStatsFromDB(true);
    }

    getStatsFromDB(logInfo = false, callback) {
        con.connect((err) => {
            if (err) console.log(`Connection error: ${err}`);

            con.query(`SELECT * FROM accounts WHERE id = '${this.id}'`, (err2, result) => {
                if (err2) console.log(`Query error: ${err2}`);
                if (result.length > 0) {
                    const profile = result[0];
                    this.bodyweight = profile.bodyweight;
                    this.level = profile.level;
                    this.xp = profile.xp;
                    this.creationDate = profile.creationtate;
                    this.skipTotal = profile.skiptotal;
                    this.skipStreak = profile.skipstreak;
                    this.squat = profile.squat;
                    this.bench = profile.bench;
                    this.deadlift = profile.deadlift;
                    this.currentSetNumber = profile.currentsetnumber;

                    if (callback) callback(true);
                } else {
                    //con.query(`INSERT INTO accounts (id, name, bodyweight, level, xp, creationDate)`)
                }

                if (logInfo) console.log(result[0]);
            });
        })
    }

    writeStatsToDB(logInfo = false, callback) {
        con.connect((err) => {
            if (err) console.log(`Connection error: ${err}`);

            con.query(`UPDATE accounts SET 
            bodyweight = ${this.bodyweight},
            level = ${this.level},
            xp = ${this.xp},
            skiptotal = ${this.skipTotal},
            skipstreak = ${this.skipStreak},
            squat = ${this.squat},
            bench = ${this.bench},
            deadlift = ${this.deadlift},
            currentsetnumber = ${this.currentSetNumber} 
            WHERE id = '${this.id}'`, (err2, result) => {
                if (err2) console.log(`Query error: ${err2}`);
                if (logInfo) console.log(result);
            }, (err2, result) => {
                if (err2) console.log(`Error updating accounts: ${err2}`);
                if (callback) callback();
            })
        })
    }

    getName(){
        return this.name;
    }
    getId(){
        return this.id;
    }
    getBodyweight(){
        return this.bodyweight;
    }
    getLevel(){
        return this.level;
    }
    getXp(){
        return this.xp;
    }
    getCreationDate(){
        return this.creationDate;
    }
    getHistory(){
        return this.history;
    }
    getSkipTotal(){
        return this.skipTotal;
    }
    getSkipStreak(){
        return this.skipStreak;
    }
    getTotalDays(){
        return this.history.length;
    }
    getRestDays(){
        return this.restDays;
    }
    getSquat(){
        return this.squat;
    }
    getBench(){
        return this.bench;
    }
    getDeadlift(){
        return this.deadlift;
    }
    getTotal(){
        return this.squat + this.bench + this.deadlift;
    }
    getStats(movement){
        if (movement == null || this.history.length <= 0) return;

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

        for (let i = this.history.length - 1; i >= 0; i--) {
            for (let j = 0; j < this.history[i].getSets().length; j++) {
                let currentSet = this.history[i].getSets()[j];

                if (currentSet.getMovement() == movement) {
                    if (i > this.history.length - 30) {
                        thirtyDayAvgWeight += currentSet.getWeight();
                        thirtyDayAvgReps += currentSet.getReps();
                        thirtyDayCount++;
                    }
                    if (currentSet.getWeight() > mostWeight) {
                        mostWeight = currentSet.getWeight();
                        mostWeightDate = this.history[i].getDate();
                    }
                    if (currentSet.getReps() > mostReps) {
                        mostReps = currentSet.getReps();
                        mostRepsDate = this.history[i].getDate();
                    }
                    if (currentSet.getSetTotal() > bestTotal) {
                        bestTotal = currentSet.getSetTotal();
                        bestSetWeight = currentSet.getWeight();
                        bestSetReps = currentSet.getReps();
                        bestSetDate = this.history[i].getDate();
                    }
                        
                    lifetimeCount++;
                }
            }
        }
        
        thirtyDayAvgWeight /= thirtyDayCount;
        thirtyDayAvgReps /= thirtyDayCount;
        
        if (lifetimeCount == 0) {
            return new EmbedBuilder().setTitle(`No data logged for ${movement}`);
        } else {
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

            return statsEmbed;
        }
    }

    // Leaving this here in case I decide to use it for something else in the future
    // Essentially replaced with the data version below.
    getAverages(exercise) {
        if (this.history.length < 1) return null;

        let averages = [];
        let total = 0;
        let count = 0;

        for (const day of this.history) {
            for (const set of day.getSets()) {
                if (set.getMovement() == exercise) {
                    total += set.getSetTotal();
                    count++;
                }
            }
            if (total == 0 && count == 0) {
                continue;
            } else if(total == 0) {
                averages.push(0);
            } else {
                averages.push(total / count);
            }
            count = 0;
            total = 0;
        }

        return averages;
    }

    // Gets the averages in data form for use in graphing
    getAverageData(exercise) {
        if (this.history.length < 1) return null;

        let averages = [];
        let total = 0;
        let count = 0;

        for (const day of this.history) {
            for (const set of day.getSets()) {
                if (set.getMovement() == exercise) {
                    total += set.getSetTotal();
                    count++;
                }
            }
            const dateString = new Date(Date.parse(day.getDate())).toLocaleDateString();
            if (total == 0 && count == 0) {
                continue;
            } else if(total == 0) {
                let average = {
                    day: dateString,
                    avg: 0
                }
                averages.push(average);
            } else {
                let average = {
                    day: dateString,
                    avg: total / count
                }
                averages.push(average);
            }
            count = 0;
            total = 0;
        }

        return averages;
    }

    //Returns the embed(s) for all of the sets for a given (days) starting from (startDate)
    getHistoryEmbeds(days, startDate, callback){
        let startDay;
        if (startDate) {
            startDay = new Date(Date.parse(startDate)).toDateString();
        } else {
            startDay = new Date().toDateString();
        }

        let historyEmbeds = [];
        
        con.connect((err) => {
            if (err) console.log(`Connection error in history: ${err}`);
             con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND date = '${startDay}';`, (err2, results) => {
                if (err2) console.log(`Error reading data for history: ${err2}`);

                historyEmbeds = WorkoutDay.getEmbeds(results);
                if (historyEmbeds.length < 1) {
                    historyEmbeds =  new EmbedBuilder().setTitle("No history.");
                }

                callback(historyEmbeds);
            })
        })
        //let printDays = days;

        /*if (days > 7) {
            printDays = 7;
        }
        if (this.history.length < days) {
            printDays = this.history.length;
        }

        for (let i = printDays; i >= 1; i--) {
            for (let j = 0; j < this.history[startIndex - i].getEmbeds().length; j++) {
                historyEmbeds.push(this.history[startIndex - i].getEmbeds()[j]);
            }
        }*/
    }

    getRestDayString(){
        let restDaysString = "";
        for (let i = 0; i < this.restDays.length; i++) {
            switch (this.restDays[i]) {
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
            if(this.bodyweight > 0){
                profileEmbed.addFields({ name: `Body weight:`, value: `${this.bodyweight}lbs` });
            }
            profileEmbed.addFields({ name: `Days Skipped:`, value: ` ${this.skipTotal} days`, inline: true })
            .addFields({ name: `Current Skip Streak:`, value: `${this.skipStreak} days`, inline: true })
            //.addFields({ name: "Rest Days:", value: this.getRestDayString(), inline: true });
            if(this.squat > 0){
                profileEmbed.addFields({ name: `Squat:`, value: `${this.squat}lbs`, inline: true });
            }
            if(this.bench > 0){
                profileEmbed.addFields({ name: `Bench:`, value: `${this.bench}lbs`, inline: true });
            }
            if(this.deadlift > 0){
                profileEmbed.addFields({ name: `Deadlift:`, value: `${this.deadlift}lbs`, inline: true });
            }

            if (callback) callback(profileEmbed);
        });
    }

    logSet(movement, weight, reps, callback){
        let today = new Date().toDateString();
        
        this.xp += Set.getXPAmount(movement, weight, reps, this.bodyweight);
        
        this.currentSetNumber++;

        con.connect((err) => {
            if (err) console.log(`Connection error: ${err}`);
            con.query(`INSERT INTO lifts (userID, movement, weight, reps, date, setnumber) VALUES (
                '${this.id}',
                '${movement}',
                ${weight},
                ${reps},
                '${today}',
                ${this.currentSetNumber}
            )`, (err2, results) => {
                if (err2) console.log(`Error inserting new set: ${err2}`);

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
        let today = new Date().toDateString();
        let repeatWeight, repeatReps;

        con.connect((err) => {
            if (err) console.log(`Connection error in repeat set: ${err}`);
            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND date = '${today}' ORDER BY setid DESC;`, (err2, sets) => {
                if (err2) console.log(`Querying error in repeat set: ${err2}`);
                if (sets.length > 1) {
                    const lastSet = new Set(sets[0].movement, sets[0].weight, sets[0].reps, this.bodyweight);
                    repeatWeight = weight ? weight : lastSet.getWeight();
                    repeatReps = reps ? reps : lastSet.getReps();

                    for (let i = 0; i < repeats; i++) {
                        if (i == repeats - 1) break;

                        this.logSet(lastSet.getMovement(), repeatWeight, repeatReps);
                    }
                    // I want the callback for the last one.
                    this.logSet(lastSet.getMovement(), repeatWeight, repeatReps, () => {
                        if (callback) callback(new Set(lastSet.getMovement(), repeatWeight, repeatReps, this.bodyweight));
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
        this.writeInfo();
    }

    undoSet(sets, callback){
        let today = new Date().toDateString();

        let removeSets = sets || 1;
        if(removeSets <= 0) removeSets = 1;

        con.connect((err) => {
            if (err) console.log(`Connection error: ${err}`);
            con.query(`SELECT * FROM lifts WHERE userID = '${this.id}' AND date = '${today}' ORDER BY setid DESC;`, (err2, results) => {
                if (err2) console.log(`Query error undoing set: ${err2}`);
                if (results.length == 0) return false;

                removeSets = removeSets > results.length ? results.length : removeSets;

                for (let i = 0; i < removeSets; i++) {
                    let set = results[i];

                    con.query(`DELETE FROM lifts WHERE setid = ${set.setid};`, (err3, delResult) => {
                        if (err3) console.log(`Deletion error undoing set: ${err3}`);

                        console.log(`xp: ${this.xp}`);
                        this.xp -= Set.getXPAmount(set.movement, set.weight, set.reps, this.bodyweight);
                        console.log(`xp: ${this.xp}`);
                        while (this.xp < 0) {
                            this.level--;
                            this.xp += this.level * 1500;
                            console.log(`xp: ${this.xp}`);
                        }

                        this.currentSetNumber--;
                        this.writeStatsToDB();
                    });
                }
                if (callback) callback(true);
            });
        });
    }

    setBodyweight(newBodyweight){
        this.bodyweight = newBodyweight;
        this.writeInfo();
    }
    setRestDays(newRestDays){
        this.restDays = newRestDays;
        this.writeInfo();
    }
    setSquat(newSquat){
        this.squat = newSquat;
        this.writeInfo();
    }
    setBench(newBench){
        this.bench = newBench;
        this.writeInfo();
    }
    setDeadlift(newDeadlift){
        this.deadlift = newDeadlift;
        this.writeInfo();
    }
    setDayLabel(newLabel){
        let today = new Date().toDateString();

        if (this.history.length >= 1 && this.history[this.history.length - 1].getDate() === today) {
            this.history[this.history.length - 1].setLabel(newLabel);
            this.writeInfo();
            return true;
        } else {
            return false;
        }
    }
}

module.exports = Account