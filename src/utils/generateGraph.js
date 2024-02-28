const vega = require("vega");
const { createPNGStream } = require("canvas");
const fs = require("fs");

module.exports = (data, title, fileNum) => {
    if (data.length < 1) return false;

    let tableValues = [];

    for (let i = 0; i < data.length; i++) {
        tableValues.push({ "x": i + 1, "y": data[i] })
    }

    const graph = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 400,
        "height": 200,
        "padding": 5,
        "background": "white",
        "data": [
            {
                "name": "table",
                "values": tableValues
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
                "title": "Average Set Total",
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
                        "stroke": { "value": "black" },
                        "strokewidth": { "value": 4 },
                        "strokeOpacity": 1
                    }
                },
                "defined": true
            }
        ]
    };

    const view = new vega.View(vega.parse(graph), {renderer: "none"});
    const out = fs.createWriteStream(".\\src\\graphs\\graph" + fileNum + ".png")

    view.toCanvas().then(function(canvas) {
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on("finish", () => { console.log("graph generated") })
    });

    return true;
}