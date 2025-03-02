const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { findAccount } = require("../../index.js");
const getAverageTimeSets = require("../../utils/getAverageTimeSets.js");

module.exports = {
    name: "summary",
    description: "See a summary of your workout for the day or [date] specified.",
    options: [
        {
            name: "date",
            description: "Date to summarize.",
            type: ApplicationCommandOptionType.String
        }
    ],
    callback: (client, interaction) => {
        const account = findAccount(interaction.user.username, interaction.user.id);
        let date = new Date(Date.parse(interaction.options.get("date")?.value)).toDateString();
        if (date == "Invalid Date") {
            date = new Date().toDateString();
        }

        getAverageTimeSets(account, date, (average) => {
            const embed = new EmbedBuilder()
                .setTitle(date);

            let avgTimeStr = `Average time between sets: ${Math.floor(average / 60)} minutes`;
            if (average % 60 != 0) {
                avgTimeStr += ` ${average % 60} seconds`
            }
            embed.setFooter({text: avgTimeStr});

            account.getBreakdown(date, (breakdown) => {
                account.getCardio(date, (cardio) => {
                    embed.addFields({name: "Muscle Groups", value: breakdown[0]})
                    embed.addFields({name: "Scores", value: breakdown[1]})

                    if (cardio != '') {
                        embed.addFields({name: "Cardio:", value: cardio})
                    }

                    interaction.reply({embeds: [embed]});
                })
            })
        })
    }
}