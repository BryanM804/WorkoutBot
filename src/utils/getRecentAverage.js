const createConnection = require("../createConnection");

const con = createConnection();

module.exports = (user, movement, callback) => {
    con.connect((conErr) => {
        if (conErr) console.log(`Connection error in recent average: ${conErr}`);

        const currentDateVal = Date.parse(new Date().toDateString()); // Yes I know this looks stupid
        const lowestDateVal = currentDateVal - 2592000000;

        const qry = `SELECT AVG(settotal)
                    FROM lifts
                    WHERE movement = '${movement}'
                    AND userID = '${user.id}'
                    AND dateval >= ${lowestDateVal};`

        con.query(qry, (err, results) => {
            if (err) console.log(`Query Error fetching recent average: ${err}`);

            if (callback) callback(results[0]["AVG(settotal)"]);
        })
    })
}