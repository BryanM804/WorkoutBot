const Set = require("./Set.js");
const pool = require("./pool.js");
const getRecentAverage = require("./utils/getRecentAverage.js");

class Account{
    constructor(name, id){
        this.name = name;
        this.id = id;
        this.getStatsFromDB(false);
    }

    getStatsFromDB(logInfo = false, callback) {
        pool.getConnection((err, con) => {
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
                    this.totalsets = profile.totalsets;
                    this.totalweight = profile.totalweight;

                    if (this.restDays.length > 0) this.restDays.pop(); // Split leaves a '' in the array

                    con.release();
                    if (callback) callback(true);
                } else {
                    // Make a new account in the db
                    con.query(`INSERT INTO accounts (id, name, bodyweight, level, xp, creationDate, skiptotal, skipstreak, squat, bench, deadlift) VALUES (
                        '${this.id}', '${this.name}', 0, 1, 0, '${new Date().toDateString()}', 0, 0, 0, 0, 0)`, (err2, result) => {
                            if (err2) console.log(`Query error creating account: ${err2}`);
                            con.release();
                            if (callback) callback(false);
                        })
                }
                if (logInfo) console.log(result[0]);
            });
        })
    }

    writeStatsToDB(logInfo = false, callback) {
        pool.getConnection((err, con) => {
            if (err) console.log(`Connection error: ${err}`);

            let restDaysString = "";
            for (let i = 0; i < this.restDays.length; i++) {
                restDaysString += parseInt(this.restDays[i]) + " ";
            }

            con.query(`SELECT SUM(settotal) FROM lifts WHERE userID = '${this.id}';`, (e, total) => {
                if (e) console.log(`Error totaling sets: ${e}`);
                
                this.totalweight = total[0]["SUM(settotal)"];
                
                con.query(`SELECT COUNT(*) FROM lifts WHERE userID = '${this.id}';`, (e, totalsets) => {
                    if (e) console.log(`Error getting set count: ${e}`);
                    this.totalsets = totalsets[0]["COUNT(*)"];

                    con.query(`UPDATE accounts SET 
                        bodyweight = ${this.bodyweight},
                        level = ${this.level},
                        xp = ${this.xp},
                        skiptotal = ${this.skipTotal},
                        skipstreak = ${this.skipStreak},
                        restdays = '${restDaysString}',
                        squat = ${this.squat},
                        bench = ${this.bench},
                        deadlift = ${this.deadlift},
                        totalweight = ${this.totalweight},
                        totalsets = ${this.totalsets}
                        WHERE id = '${this.id}';`, 
                        (err2, result) => {
                            if (err2) console.log(`Query error: ${err2}`);
                            if (logInfo) console.log(result);
                        }, (err3, result) => {
                            if (err3) console.log(`Error updating accounts: ${err3}`);
                            con.release();
                            if (callback) callback();
                        })
                })
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

        pool.getConnection((err, con) => {
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
                con.release();
                if (callback) callback();
            });
        });
    }

    
    repeatSet(weight, reps, repeats, callback){
        let repeatWeight, repeatReps;

        pool.getConnection((err, con) => {
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

                con.release();
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

        pool.getConnection((err, con) => {
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
                con.release();
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

        pool.getConnection((err, con) => {
            if (err) console.log(`Connection error getting sets breakdown: ${err}`);

            const qry = `SELECT mgroup, COUNT(*)
                        FROM lifts l, exercises e
                        WHERE l.movement = e.movement
                        AND l.userID = '${this.id}'
                        AND l.date = '${today}'
                        GROUP BY mgroup;`;

            con.query(qry, (err2, res) => {
                if (err2) console.log(`Query error getting breakdown:\n${err2}`);
                if (res == null || res.length == 0) return;

                let breakdownStr = "";

                for (const group of res) {
                    breakdownStr += `${group.mgroup}: ${group["COUNT(*)"]} sets\n`;
                }

                const scoreQry = `SELECT movement, AVG(settotal)
                                FROM lifts
                                WHERE userID = '${this.id}'
                                AND date = '${today}'
                                GROUP BY movement;`;

                con.query(scoreQry, (scErr, avgs) => {
                    if (scErr) console.log(`Query Error getting averages for breakdown:\n${scErr}`);
                    if (avgs == null || avgs.length == 0) return;

                    const finalMov = avgs[avgs.length - 1].movement;
                    breakdownStr += "\nScores:\n";

                    // Scores are the difference between today's average and their recent average of the past 30 days
                    for (const avg of avgs) {
                        getRecentAverage(this, avg.movement, date, (recentAverage) => {
                            const avgDiff = avg["AVG(settotal)"] - recentAverage;
                            const sym = avgDiff > 0 ? "+" : "";
                            
                            breakdownStr += `${avg.movement}: ${sym}${avgDiff.toFixed(1)}\n`

                            // Callback with the breakdown string once we reach the last movement in the list
                            if (avg.movement == finalMov && callback) callback(breakdownStr);
                            con.release();
                        })
                    }
                })
            });
        })
    }

    getCardio(date, callback) {
        let today;
        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }

        pool.getConnection((err, con) => {
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
                con.release();
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

        pool.getConnection((err, con) => {
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
                        con.release();
                    });
                }
                if (callback) callback(true);
            });
        });
    }

    getTotalDays(callback){
        pool.getConnection((err, con) => {
            if (err) console.log(`Connection error getting total days: ${err}`);
            con.query(`SELECT DISTINCT date FROM lifts WHERE userID = '${this.id}' ORDER BY date;`, (err2, allDates) => {
                if (allDates.length < 1) {
                    this.totalDays = 0;
                    return;
                }

                this.totalDays = allDates.length; // This method would always be called before this needs to be displayed
                if (callback) callback(allDates.length);
                con.release();
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