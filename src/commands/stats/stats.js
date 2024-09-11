const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");

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
        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        
        userAccount.getStats(interaction.options.get("movement").value, (embed) => {
            interaction.reply({ embeds: [embed] });
            console.log(`${interaction.user.username} fetched stats for their ${interaction.options.get("movement").value}.`);
        });
    }
}