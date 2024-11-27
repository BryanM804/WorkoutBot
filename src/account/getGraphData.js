const pool = require("../pool");

module.exports = (user, exercise, type, timeframe, callback) => {
// Gets data for use in graphing
    let data = [];

    // 60 days
    const lowestDateVal = Date.parse(new Date().toDateString()) - 5184000000;

    let qry = "";

    if (timeframe == "today") {
        qry = `SELECT settotal
                FROM lifts
                WHERE movement = '${exercise}'
                AND userID = '${user.id}'
                AND date = '${new Date().toDateString()}'
                ORDER BY setid ASC`;
    } else {
        switch (type) {
            case "sets":
                qry += `SELECT date, AVG(settotal) `;
                break;
            case "strength":
                qry += `SELECT date, MAX(weight) `;
                break;
            case "best":
                qry += `SELECT date, MAX(settotal) `;
                break;
        }

        qry += `FROM lifts
                WHERE movement = '${exercise}'
                AND userID = '${user.id}' `;

        if (timeframe == "recent") {
            qry += `AND dateval >= ${lowestDateVal} `;
        }

        qry += `GROUP BY date, dateval
                ORDER BY dateval ASC;`;
    }

    pool.query(qry, (err, rawData) => {
        if (err) console.log(`Querying error getting avgs: ${err}`);

        if (rawData.length == 0) return;
        
        if (timeframe != "today") {
            for (const p of rawData) {
                // Adding each date to the array of points
                let point = {
                    "x": new Date(Date.parse(p.date)).toLocaleDateString(),
                    "y": 0
                }
                
                switch (type) {
                    case "sets":
                        point.y = p["AVG(settotal)"];
                        break;
                    case "strength":
                        point.y = p["MAX(weight)"];
                        break;
                    case "best":
                        point.y = p["MAX(settotal)"];
                        break;
                }

                data.push(point);
            }
        } else {    
            for (let i = 0; i < rawData.length; i++) {
                // Adding each set as a point
                let point = {
                    "x": i + 1,
                    "y": rawData[i].settotal
                }

                data.push(point);
            }
        }

        if (callback) callback(data);
    });
}