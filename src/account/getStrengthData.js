const pool = require("../pool");

module.exports = (user, exercise, callback) => {
    let maxes = [];
    let max = 0;

    pool.getConnection((err, con) => {
        if (err) console.log(`Connection error getting maxes: ${err}`);

        con.query(`SELECT * FROM lifts WHERE userID = '${user.id}' AND movement = '${exercise}' ORDER BY dateval DESC`, (err2, sets) => {
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

            con.release();
            if (callback) callback(maxes);
        });
    })
}