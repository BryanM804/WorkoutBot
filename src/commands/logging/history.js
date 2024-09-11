const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");

module.exports = {
    name: "history",
    description: "Get your history log up to 7 days",
    options: [
        {
            name: "days",
            description: "Amount of days back you want to go.",
            type: ApplicationCommandOptionType.Integer
        },
        {
            name: "date",
            description: "Specific date you want your history on.",
            type: ApplicationCommandOptionType.String
        }
    ],
    callback: (client, interaction) => {
        let days = interaction.options.get("days")?.value ?? 1;
        let startDate = interaction.options.get("date")?.value ?? null;

        if (days <= 0) {
            interaction.reply({ content: "Invalid number of days.", ephemeral: true });
        } else {
            let userAccount = findAccount(interaction.user.username, interaction.user.id);
            userAccount.getHistoryEmbeds(days, startDate, (historyEmbeds) => {
                if (startDate) {
                    console.log(`${interaction.user.username} fetched ${days} days of history from ${new Date(Date.parse(startDate)).toDateString()}.`);
                } else {
                    console.log(`${interaction.user.username} fetched ${days} days of history from most recent date.`)
                }
                interaction.reply({ embeds: historyEmbeds });
            });
        }
    }
}