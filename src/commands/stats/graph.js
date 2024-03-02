const { ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");
const getAllFiles = require("..\\..\\utils\\getAllFiles.js")
const generateGraph = require("..\\..\\utils\\generateGraph.js");

module.exports = {
    name: "graph",
    description: "Generate a graph of average totals for a certain exercise across all logged days.",
    options: [
        {
            name: "movement",
            description: "Type of movement.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        }
    ],
    callback: (client, interaction) => {
        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        const movement = interaction.options.get("movement").value;
        //const averages = userAccount.getAverages(movement);
        userAccount.getAverageData(movement, (averages) => {
            let fileNum = 0;

            const files = getAllFiles(".\\src\\graphs");
            for(const file of files) {
                const end = file.split("\\").pop().substring(5);
                const graphNumber = parseInt(end.replace(".png", ""));
                if (graphNumber >= fileNum) {
                    fileNum = graphNumber + 1;
                }
            }

            generateGraph(averages, fileNum, (result) => {
                if (!result) {
                    interaction.reply({ content: "Not enough data for " + movement, ephemeral: true });
                    console.log(`${interaction.user.username} tried to graph history for ${movement} but doesn't have enough data.`);
                } else {
                    const graph = new AttachmentBuilder(".\\src\\graphs\\graph" + fileNum + ".png");

                    const graphEmbed = new EmbedBuilder()
                        .setTitle(`${interaction.user.username}'s ${movement}`)
                        .setImage("attachment://graph" + fileNum + ".png");

                    interaction.reply({ embeds: [graphEmbed], files: [graph] });
                    console.log(`${interaction.user.username} graphed history of their ${movement}.`)
                }
            });
        });
    }
}