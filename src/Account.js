const Set = require("./Set.js");
const pool = require("./pool.js");
const getRecentAverage = require("./utils/getRecentAverage.js");

class Account{
    constructor(name, id){
        this.name = name;
        this.id = id;
        this.getStatsFromDB(false);
    }

    async getStatsFromDB(logInfo = false) {
        pool.query(`SELECT * FROM accounts WHERE id = '${this.id}'`, (err, result) => {
            if (err) console.log(`Query error getting stats: ${err}`);
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

                return true;
            } else {
                // Make a new account in the db
                pool.query(`INSERT INTO accounts (id, name, bodyweight, level, xp, creationDate, skiptotal, skipstreak, squat, bench, deadlift) VALUES (
                    '${this.id}', '${this.name}', 0, 1, 0, '${new Date().toDateString()}', 0, 0, 0, 0, 0)`, (err2, result) => {
                        if (err2) console.log(`Query error creating account: ${err2}`);
                        return false;
                    })
            }
            if (logInfo) console.log(result[0]);
        });
    }

    async writeStatsToDB(logInfo = false) {
        let restDaysString = "";
        for (let i = 0; i < this.restDays.length; i++) {
            restDaysString += parseInt(this.restDays[i]) + " ";
        }

        pool.query(`SELECT SUM(settotal) FROM lifts WHERE userID = '${this.id}';`, (e, total) => {
            if (e) console.log(`Error totaling sets: ${e}`);
            
            this.totalweight = total[0]["SUM(settotal)"];
            
            pool.query(`SELECT COUNT(*) FROM lifts WHERE userID = '${this.id}';`, (e2, totalsets) => {
                if (e2) console.log(`Error getting set count: ${e2}`);
                this.totalsets = totalsets[0]["COUNT(*)"];

                pool.query(`UPDATE accounts SET 
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
                    WHERE id = '${this.id}';`, (err2, result) => {
                    if (err2) console.log(`Query error: ${err2}`);
                    if (logInfo) console.log(result);
                    return;
                })
            })
        })
    }

    async logSet(movement, weight, reps, date){
        let today;
        let time = new Date().toLocaleTimeString("en-US");

        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }
        
        this.xp += Set.getXPAmount(movement, weight, reps, this.bodyweight);

        pool.query(`INSERT INTO lifts (userID, movement, weight, reps, date, settotal, dateval, time) VALUES (
            '${this.id}',
            '${movement}',
            ${weight},
            ${reps},
            '${today}',
            ${Set.getSetTotal(movement, weight, reps, this.bodyweight)},
            ${Date.parse(today)},
            '${time}'
        )`, async (err, results) => {
            // This should throw an error or else the accounts and lifts tables will desync (ask me how I know)
            if (err) {
                console.log(`Error inserting new set`);
                throw err;
            }

            // Level up loop
            while (this.xp >= this.level * 1500) {
                this.xp -= (this.level * 1500);
                this.level++;
                console.log(`${this.name} leveled up to ${this.level}`);
            }

            this.skipStreak = 0;
            await this.writeStatsToDB();
            return;
        });
    }

    
    async repeatSet(weight, reps, repeats){
        let repeatWeight, repeatReps;

        pool.query(`SELECT * FROM lifts WHERE userID = '${this.id}' ORDER BY dateval DESC, setid DESC;`, async (err, sets) => {
            if (err) console.log(`Querying error in repeat set: ${err}`);

            if (sets.length > 0) {
                const lastSet = new Set(sets[0].movement, sets[0].weight, sets[0].reps, this.bodyweight);
                repeatWeight = weight ? weight : lastSet.weight;
                repeatReps = reps ? reps : lastSet.reps;

                for (let i = 0; i < repeats - 1; i++) {
                    await this.logSet(lastSet.movement, repeatWeight, repeatReps, sets[0].date);
                }

                // I want the callback for the last one.
                await this.logSet(lastSet.movement, repeatWeight, repeatReps, sets[0].date)
                return new Set(lastSet.movement, repeatWeight, repeatReps, this.bodyweight);
            } else {
                return false;
            }
        });
    }

    async logCardio(movement, time, date, note, distance) {
        let today;
        let localTime = new Date().toLocaleTimeString("en-US");

        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }
            
        pool.query(`INSERT INTO cardio (userid, movement, cardiotime, date, time, note, distance) VALUES (
            '${this.id}',
            '${movement}',
            ${time},
            '${today}',
            '${localTime}',
            '${note}',
            '${distance}'
        )`, async (err2, results) => {
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
            
            await this.writeStatsToDB();
            return;
        });
    }

    async getBreakdown(date) {
        let today;
        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }

        const qry = `SELECT mgroup, COUNT(*)
                    FROM lifts l, exercises e
                    WHERE l.movement = e.movement
                    AND l.userID = '${this.id}'
                    AND l.date = '${today}'
                    GROUP BY mgroup;`;

        pool.query(qry, (err, res) => {
            if (err) console.log(`Query error getting breakdown:\n${err}`);
            if (res == null || res.length == 0) return;

            let breakdownStrs = [];
            let groupStr = ""

            for (const group of res) {
                groupStr += `${group.mgroup}: ${group["COUNT(*)"]} sets\n`;
            }
            breakdownStrs.push(groupStr);

            const scoreQry = `SELECT movement, AVG(settotal)
                            FROM lifts
                            WHERE userID = '${this.id}'
                            AND date = '${today}'
                            GROUP BY movement;`;

            pool.query(scoreQry, async (scErr, avgs) => {
                if (scErr) console.log(`Query Error getting averages for breakdown:\n${scErr}`);
                if (avgs == null || avgs.length == 0) return;

                const finalMov = avgs[avgs.length - 1].movement;

                // Scores are the difference between today's average and their recent average of the past 30 days
                let lines = 0
                let scoreStr = ""
                for (const avg of avgs) {
                    const recentAverage = await getRecentAverage(this, avg.movement, date)
                    const avgDiff = avg["AVG(settotal)"] - recentAverage;
                    const sym = avgDiff > 0 ? "+" : "";
                    
                    scoreStr += `${avg.movement}: ${sym}${avgDiff.toFixed(1)}\n`
                    lines++;

                    if (lines == avgs.length) {
                        breakdownStrs.push(scoreStr)
                        return breakdownStrs;
                    }
                }
            })
        });
    }

    async getCardio(date) {
        let today;
        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }
            
        pool.query(`SELECT * FROM cardio WHERE userid = '${this.id}' AND date = '${today}';`, (err, results) => {
            if (err) console.log(`Error getting sets for breakdown:\n ${err}`);

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

            return cardioStr;
        })
    }

    async skipDay(){
        this.skipTotal++;
        this.skipStreak++;
        await this.writeStatsToDB();
    }

    async undoSet(sets){

        let removeSets = sets || 1;
        if(removeSets <= 0) removeSets = 1;

        pool.query(`SELECT * FROM lifts WHERE userID = '${this.id}' ORDER BY dateval DESC, setid DESC;`, (err, results) => {
            if (err) console.log(`Query error undoing set: ${err}`);
            if (results.length == 0) {
                return false;
            }

            removeSets = removeSets > results.length ? results.length : removeSets;

            for (let i = 0; i < removeSets; i++) {
                let set = results[i];

                pool.query(`DELETE FROM lifts WHERE setid = ${set.setid};`, async (err2, delResult) => {
                    if (err2) console.log(`Deletion error undoing set: ${err2}`);

                    this.xp -= Set.getXPAmount(set.movement, set.weight, set.reps, this.bodyweight);

                    while (this.xp < 0) {
                        this.level--;
                        this.xp += this.level * 1500;
                    }

                    await this.writeStatsToDB();
                });
            }
        });
    }

    async getTotalDays(){
        pool.query(`SELECT DISTINCT date FROM lifts WHERE userID = '${this.id}' ORDER BY date;`, (err, allDates) => {
            if (allDates.length < 1) {
                this.totalDays = 0;
                return;
            }

            this.totalDays = allDates.length; // This method would always be called before this needs to be displayed
            return allDates.length;
        });
    }

    getTotal(){
        return this.squat + this.bench + this.deadlift;
    }

    async setBodyweight(newBodyweight){
        this.bodyweight = newBodyweight;
        await this.writeStatsToDB();
    }
    async setRestDays(newRestDays){
        this.restDays = newRestDays;
        await this.writeStatsToDB();
    }
    async setSquat(newSquat){
        this.squat = newSquat;
        await this.writeStatsToDB();
    }
    async setBench(newBench){
        this.bench = newBench;
        await this.writeStatsToDB();
    }
    async setDeadlift(newDeadlift){
        this.deadlift = newDeadlift;
        await this.writeStatsToDB();
    }
}

module.exports = Account