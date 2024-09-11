const sql = require("mysql2")
const createConnection = require("../createConnection")
const con = createConnection()

module.exports = (userAccount, date, callback) => {
    if (userAccount == null) {
        console.log(`Invalid user account trying to get time data`);
        return -1;
    }

    con.connect((err) => {
        if (err) console.log(`Connection error getting time data:\n ${err}`);

        const today = date;

        con.query(`SELECT * FROM lifts WHERE userID = '${userAccount.id}' AND date = '${today}'`, (err2, sets) => {
            if (err2) console.log(`Query error getting time data:\n ${err2}`);
            if (sets != null && sets.length <= 0) {
                console.log(`${userAccount.name} has no data for ${today}`);
                return -1;
            }
            
            let avg = 0;
            let count = 0;

            for (let i = 1; i < sets.length; i++) {
                if (sets[i - 1].time == null) {
                    console.log(`${userAccount.name}'s data for ${today} is missing time information.`);
                    return -1;
                }
                
                let time1 = Date.parse(sets[i].date + " " + sets[i].time);
                let time2 = Date.parse(sets[i - 1].date + " " + sets[i - 1].time);

                // console.log(`Time 1: ${sets[i].time} converted to ${time1}, Time 2: ${sets[i - 1].time} converted to ${time2}`)

                avg += (time1 - time2);
                count++;
            }

            if (callback) callback(Math.ceil((avg / count) / 1000));
        })
    })
}