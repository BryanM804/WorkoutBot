const pool = require("../pool");

module.exports = async (user, movement, date=null) => {
    let today;
    if (date != null) {
        today = date;
    } else {
        today = new Date().toDateString();
    }

    const currentDateVal = Date.parse(today);
    // const lowestDateVal = currentDateVal - 2592000000;
    // Using 60 days now, usually not a lot of data for only 30 days of a specific movement
    const lowestDateVal = currentDateVal - 5184000000;

    const qry = `SELECT AVG(settotal)
                FROM lifts
                WHERE movement = '${movement}'
                AND userID = '${user.id}'
                AND dateval >= ${lowestDateVal};`

    const results = await pool.query(qry)
    return results[0]["AVG(settotal)"];
}