const { ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { findAccount } = require("../../index.js");
const getAllFiles = require("../../utils/getAllFiles.js")
const generateGraph = require("../../utils/generateGraph.js");
const getGraphData = require("../../account/getGraphData.js");
const getRecentAverage = require("../../utils/getRecentAverage.js");

module.exports = {
    name: "graph",
    description: "Generate graphs of your lifting data. (Using \"Today\" overrides the type of graph)",
    options: [
        {
            name: "movement",
            description: "Type of movement.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: "type",
            description: "Type of graph.",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Average Set",
                    value: "sets"
                },
                {
                    name: "Strength",
                    value: "strength"
                },
                {
                    name: "Best Set per Day",
                    value: "best"
                }
            ]
        },
        {
            name: "timeframe",
            description: "Period of time to graph.",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "All",
                    value: "all"
                },
                {
                    name: "Recent",
                    value: "recent"
                },
                {
                    name: "Today",
                    value: "today"
                }
            ]
        }
    ],
    callback: (client, interaction) => {
        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        const movement = interaction.options.get("movement").value;
        const type = interaction.options.get("type")?.value ? interaction.options.get("type").value : "sets";
        const timeframe = interaction.options.get("timeframe")?.value ? interaction.options.get("timeframe").value : "all";

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
                .setTitle(`${interaction.user.username}'s ${adj}${timeAdj}${movement}`);

            // Unfortunate giant duplicated code
            if (timeframe == "today") {
                getRecentAverage(userAccount, movement, null, (recentAvg) => {
                    dataOb["baseline"] = recentAvg;

                    generateGraph(dataOb, fileNum, type, timeframe, (result) => {
                        if (!result) {
                            interaction.reply({ content: "Not enough data for " + movement, ephemeral: true });
                            console.log(`${interaction.user.username} tried to graph history for ${movement} but doesn't have enough data.`);
                        } else {
                            const graph = new AttachmentBuilder("./src/graphs/graph" + fileNum + ".png");
                                   
                            graphEmbed.setImage("attachment://graph" + fileNum + ".png");
        
                            interaction.reply({ embeds: [graphEmbed], files: [graph] });
                            console.log(`${interaction.user.username} graphed history of their ${movement}.`)
                        }
                    });
                })
            } else {
                generateGraph(dataOb, fileNum, type, timeframe, (result) => {
                    if (!result) {
                        interaction.reply({ content: "Not enough data for " + movement, ephemeral: true });
                        console.log(`${interaction.user.username} tried to graph history for ${movement} but doesn't have enough data.`);
                    } else {
                        const graph = new AttachmentBuilder("./src/graphs/graph" + fileNum + ".png");

                        graphEmbed.setImage("attachment://graph" + fileNum + ".png");
    
                        interaction.reply({ embeds: [graphEmbed], files: [graph] });
                        console.log(`${interaction.user.username} graphed history of their ${movement}.`)
                    }
                });
            }
        });
    }
                
}