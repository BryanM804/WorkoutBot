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
        const averages = userAccount.getAverages(movement);
        let fileNum = 0;

        const files = getAllFiles(".\\src\\graphs");
        for(const file of files) {
            const end = file.split("\\").pop().substring(5);
            const graphNumber = parseInt(end.replace(".png", ""));
            if (graphNumber >= fileNum) {
                fileNum = graphNumber + 1;
            }
        }

        if (!generateGraph(averages, movement, fileNum)) {
            interaction.reply("You have no history for " + movement);
        } else {
            // Without waiting here it doesn't recognize that the file has been created yet.
            setTimeout(function () { sendReply(interaction, movement, fileNum) }, 500);
        }
    }
}

function sendReply(interaction, movement, fileNum) {
    const graph = new AttachmentBuilder(".\\src\\graphs\\graph" + fileNum + ".png");

    const graphEmbed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s ${movement}`)
        .setImage("attachment://graph" + fileNum + ".png");

    interaction.reply({ embeds: [graphEmbed], files: [graph] });
}