const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const getAllFiles = require("../utils/getAllFiles.js")
const generateGraph = require("../utils/generateGraph.js");
const getGraphData = require("../account/getGraphData.js");
const getRecentAverage = require("../utils/getRecentAverage.js");

module.exports = async (userAccount, movement, type, timeframe) => {
    data = await getGraphData(userAccount, movement, type, timeframe)
    let fileNum = 0;

    const files = getAllFiles("./src/graphs");
    for(const file of files) {
        const end = file.split("/").pop().substring(5);
        const graphNumber = parseInt(end.replace(".png", ""));
        if (graphNumber >= fileNum) {
            fileNum = graphNumber + 1;
        }
    }

    let dataOb = {
        "data": data
    }

    let adj, timeAdj;
    switch (type) {
        case "sets":
            adj = "average ";
            break;
        case "strength":
            adj = "strongest ";
            break;
        case "best":
            adj = "best ";
            break;
    }
    switch (timeframe) {
        case "all":
            timeAdj = "";
            break;
        case "recent":
            timeAdj = "recent ";
            break;
        case "today":
            timeAdj = "current sets of ";
            adj = "";
            break;
    }
    const graphEmbed = new EmbedBuilder()
        .setTitle(`${userAccount.name}'s ${adj}${timeAdj}${movement}`);

    if (timeframe == "today") {
        const recentAvg = await getRecentAverage(userAccount, movement, null);
        dataOb["baseline"] = recentAvg;

        const success = await generateGraph(dataOb, fileNum, type, timeframe)
        return await sendGraph(userAccount, fileNum, movement, graphEmbed, success);
    } else {
        const success = await generateGraph(dataOb, fileNum, type, timeframe);
        return await sendGraph(userAccount, fileNum, movement, graphEmbed, success);
    }
}

async function sendGraph(userAccount, fileNum, movement, graphEmbed, success) {
    if (success) {
        const graph = new AttachmentBuilder("./src/graphs/graph" + fileNum + ".png");

        graphEmbed.setImage("attachment://graph" + fileNum + ".png");

        console.log(`${userAccount.name} graphed history of their ${movement}.`)
        return ({ embeds: [graphEmbed], files: [graph] });
    } else {
        console.log(`${userAccount.name} tried to graph history for ${movement} but doesn't have enough data.`);
        graphEmbed.addFields({name: "Not enough data for " + movement, value: "Graph needs at least 2 points of data."})
        return ({ embeds: [graphEmbed], files: [] });
    }
}