const vega = require("vega");
const { createPNGStream } = require("canvas");
const fs = require("fs");
const getRecentAverage = require("./getRecentAverage");

module.exports = (data, fileNum, type, timeframe, callback) => {
    if (data.data.length < 2) {
        if (callback) callback(false);
        return;
    }

    let title;
    switch (type) {
        case "strength":
            title = "Max Weight";
            break;
        case "sets":
            title = "Average Set Total";
            break;
        case "best":
            title = "Best Set Total";
            break;
    }

    const graph = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 600,
        "height": 400,
        "padding": 5,
        "background": "black",
        "config": {
            "style": {
                "guide-label": {
                    "stroke": "white",
                    "fill": "white"
                },
                "guide-title": {
                    "stroke": "white",
                    "fill": "white"
                },
                "group-title": {
                    "stroke": "white",
                    "fill": "white"
                }
            }
        },
        "data": [
            {
                "name": "table",
                "values": data.data
            }
        ],
        "scales": [
            {
                "name": "x",
                "type": "point",
                "range": "width",
                "domain": { 
                    "data": "table",
                    "field": "x"
                }
            },
            {
                "name": "y",
                "type": "linear",
                "range": "height",
                "nice": true,
                "domain": { 
                    "data": "table", 
                    "field": "y" 
                }
            }
        ],
        "axes": [
            {
                "orient": "bottom",
                "title": "Day",
                "scale": "x"
            },
            {
                "orient": "left",
                "title": title,
                "scale": "y"
            }
        ],
        "marks": [
            {
                "type": "line",
                "from": { "data": "table" },
                "encode": {
                    "enter": {
                        "x": {
                            "scale": "x",
                            "field": "x"
                        },
                        "y": {
                            "scale": "y",
                            "field": "y"
                        },
                        "stroke": { "value": "yellow" },
                        "strokewidth": { "value": 4 },
                        "strokeOpacity": 1
                    }
                },
                "defined": true
            }
        ]
    };

    if (timeframe == "today") {
        // Duplicating the average point for every x since it is easier than using layers and stuff in vega
        let averagePts = [];
        for (const p of data.data) {
            averagePts.push({
                "x": p.x,
                "y": data.baseline
            })
        }

        graph.data.push({
            "name": "baseline",
            "values": averagePts
        })
        graph.marks.push({
            "type": "line",
            "from": { "data": "baseline" },
            "encode": {
                "enter": {
                    "x": {
                        "scale": "x",
                        "field": "x"
                    },
                    "y": {
                        "scale": "y",
                        "field": "y"
                    },
                    "stroke": { "value": "blue" },
                    "strokewidth": { "value": 4 },
                    "strokeOpacity": 1
                }
            },
            "defined": true
        })
        graph.axes[0].title = "Set"
        graph.axes[1].title = "Set Total"
    }

    const view = new vega.View(vega.parse(graph), {renderer: "none"});
    const out = fs.createWriteStream("./src/graphs/graph" + fileNum + ".png")

    view.toCanvas().then(function(canvas) {
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on("finish", () => { 
            console.log("Graph generated") ;
            if (callback) callback(true);
        });
    });

    return true;
}