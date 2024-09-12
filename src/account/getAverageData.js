const createConnection = require("../createConnection");
const con = createConnection();

module.exports = (user, exercise, callback) => {
// Gets the averages in data form for use in graphing

    let averages = [];
    let total = 0;
    let count = 0;

    con.connect((err) => {
        if (err) console.log(`Connection error getting avgs: ${err}`);

        con.query(`SELECT * FROM lifts WHERE userID = '${user.id}' AND movement = '${exercise}' ORDER BY dateval DESC`, (err2, sets) => {
            if (err2) console.log(`Querying error getting avgs: ${err2}`);

            sets.sort((a, b) => {
                const aDate = Date.parse(a.date);
                const bDate = Date.parse(b.date);
                return aDate - bDate;
            });

            if (sets.length == 0) return;

            let currDate = sets[0].date;
            for (let set of sets) {
                if (set.date == currDate) {
                    total += set.settotal != null ? set.settotal : Set.getSetTotal(set.movement, set.weight, set.reps, user.bodyweight);
                    count++;
                } else {
                    let average = {
                        day: new Date(Date.parse(currDate)).toLocaleDateString(),
                        val: total / count
                    }
                    averages.push(average);

                    currDate = set.date;
                    total = set.settotal != null ? set.settotal : Set.getSetTotal(set.movement, set.weight, set.reps, user.bodyweight);
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