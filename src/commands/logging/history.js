const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { findAccount } = require("../../index.js");
const WorkoutDay = require("../../WorkoutDay.js");
const pool = require("../../pool.js");

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

            let startDay;
    
            days = days > 7 ? 7 : days;
    
            if (startDate) {
                startDay = new Date(Date.parse(startDate)).toDateString();
            } else {
                startDay = new Date().toDateString();
            }
    
            let historyEmbeds = [];
            
            for (let i = days - 1; i >= 0; i--) {
                let date = new Date(Date.parse(startDay) - (86400000 * i)).toDateString();

                pool.query(`SELECT * FROM lifts WHERE userID = '${userAccount.id}' AND date = '${date}';`, (err, results) => {
                    if (err) console.log(`Error reading data for history: ${err}`);

                    pool.query(`SELECT * FROM labels WHERE userID = '${userAccount.id}' AND date = '${date}' ORDER BY labelid DESC;`, (err2, labels) => {
                        if (err2) console.log(`Error querying labels for history: ${err2}`);

                        let embeds = WorkoutDay.getEmbeds(results, labels.length > 0 ? labels[0].label : null);
                        
                        if (embeds) {
                            for (let x = 0; x < embeds.length; x++) {
                                historyEmbeds.push(embeds[x]);
                            }
                        } else {
                            historyEmbeds.push(new EmbedBuilder().setTitle("No history.").setAuthor({ name: date }));
                        }
                        
                        if (i == 0) {
                            if (startDate) {
                                console.log(`${interaction.user.username} fetched ${days} days of history from ${new Date(Date.parse(startDate)).toDateString()}.`);
                            } else {
                                console.log(`${interaction.user.username} fetched ${days} days of history from most recent date.`)
                            }
                            interaction.reply({ embeds: historyEmbeds });
                        }
                    });
                })
            }
        }
    }
}