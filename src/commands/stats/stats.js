const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "stats",
    description: "See statistics for a specific movement.",
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
        interaction.reply({ embeds: [findAccount(interaction.user.username, interaction.user.id).getStats(interaction.options.get("movement").value)] });
        console.log(`${interaction.user.username} fetched stats for their ${interaction.options.get("movement").value}.`);
    }
}