const vega = require("vega");

module.exports = (data, title) {
    const graph = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 400,
        "height": 200,
        "padding": 5,
        "background": "white",

        "scales": [
            {
                "name": "x",
                "type": "point",
                "range": "width",
            },
            {
                "name": "y",
                "type": "linear",
                "range": "height",
                "nice": true,
                
            }
        ]
    };

    return graph;
}