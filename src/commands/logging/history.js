const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { findAccount } = require("../../index.js");
const WorkoutDay = require("../../WorkoutDay.js");
const getHistoryEmbeds = require("../../account/getHistoryEmbeds.js");
const historyButtons = require("../../buttons/historyButtons.js");
const pool = require("../../pool.js");

module.exports = {
    name: "history",
    description: "Get your history log.",
    options: [
        {
            name: "date",
            description: "Specific date you want your history on.",
            type: ApplicationCommandOptionType.String
        }
    ],
    callback: (client, interaction) => {
        let startDate = interaction.options.get("date")?.value ?? null;

        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        let day;

        if (startDate) {
            day = new Date(Date.parse(startDate)).toDateString();
        } else {
            day = new Date().toDateString();
        }
        
        getHistoryEmbeds(interaction, day, (historicalEmbedments) => {
            historyButtons(interaction, historicalEmbedments, day);
        });
    }
}