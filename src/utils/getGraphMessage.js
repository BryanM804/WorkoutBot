const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const getAllFiles = require("../utils/getAllFiles.js")
const generateGraph = require("../utils/generateGraph.js");
const getGraphData = require("../account/getGraphData.js");
const getRecentAverage = require("../utils/getRecentAverage.js");

module.exports = (userAccount, movement, type, timeframe, callback) => {
    getGraphData(userAccount, movement, type, timeframe, (data) => {
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

        // Unfortunate giant duplicated code
        if (timeframe == "today") {
            getRecentAverage(userAccount, movement, null, (recentAvg) => {
                dataOb["baseline"] = recentAvg;

                generateGraph(dataOb, fileNum, type, timeframe, (result) => {
                    if (!result) {
                        interaction.reply({ content: "Not enough data for " + movement, ephemeral: true });
                        console.log(`${userAccount.name} tried to graph history for ${movement} but doesn't have enough data.`);
                    } else {
                        const graph = new AttachmentBuilder("./src/graphs/graph" + fileNum + ".png");
                               
                        graphEmbed.setImage("attachment://graph" + fileNum + ".png");
    
                        console.log(`${userAccount.name} graphed history of their ${movement}.`)
                        if (callback) callback({ embeds: [graphEmbed], files: [graph] })
                    }
                });
            })
        } else {
            generateGraph(dataOb, fileNum, type, timeframe, (result) => {
                if (!result) {
                    interaction.reply({ content: "Not enough data for " + movement, ephemeral: true });
                    console.log(`${userAccount.name} tried to graph history for ${movement} but doesn't have enough data.`);
                } else {
                    const graph = new AttachmentBuilder("./src/graphs/graph" + fileNum + ".png");

                    graphEmbed.setImage("attachment://graph" + fileNum + ".png");

                    console.log(`${userAccount.name} graphed history of their ${movement}.`)
                    if (callback) callback({ embeds: [graphEmbed], files: [graph] });
                }
            });
        }
    });
}