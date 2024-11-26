const pool = require("../pool");

module.exports = (user, movement, date=null, callback) => {
    pool.getConnection((conErr, con) => {
        if (conErr) console.log(`Connection error in recent average: ${conErr}`);

        let today;
        if (date) {
            today = date;
        } else {
            today = new Date().toDateString();
        }

        const currentDateVal = Date.parse(today);
        const lowestDateVal = currentDateVal - 2592000000;

        const qry = `SELECT AVG(settotal)
                    FROM lifts
                    WHERE movement = '${movement}'
                    AND userID = '${user.id}'
                    AND dateval >= ${lowestDateVal};`

        con.query(qry, (err, results) => {
            if (err) console.log(`Query Error fetching recent average: ${err}`);

            con.release();
            if (callback) callback(results[0]["AVG(settotal)"]);
        })
    })
}