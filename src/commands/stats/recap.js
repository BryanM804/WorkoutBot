const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");
const getAverageTimeSets = require("../../utils/getAverageTimeSets.js");

module.exports = {
    name: "recap",
    description: "See a recap of your workout for the day or [date] specified.",
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
            let avgTimeStr = `Average time between sets: ${Math.floor(average / 60)} minutes`;
            if (average % 60 != 0) {
                avgTimeStr += ` ${average % 60} seconds`
            }
            avgTimeStr += "\n";

            account.getBreakdown(date, (breakdown) => {
                account.getCardio(date, (cardio) => {
                    let outStr = avgTimeStr + breakdown;

                    if (cardio != '') {
                        outStr += `Cardio: ${cardio}`;
                    }

                    interaction.reply(outStr);
                })
            })
        })
    }
}