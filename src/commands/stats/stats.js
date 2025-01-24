const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { findAccount } = require("../../index.js");
const Set = require("../../Set.js");
const pool = require("../../pool.js");

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
        const movement = interaction.options.get("movement").value;

        let thirtyDayAvgWeight = 0;
        let thirtyDayAvgReps = 0;
        let mostWeight = 0;
        let mostWeightDate = "";
        let mostReps = 0;
        let mostRepsDate = "";
        let bestTotal = 0;
        let bestSetDate = "";
        let bestSetWeight = 0;
        let bestSetReps = 0;
        let lifetimeCount = 0;
        let thirtyDayCount = 0;

        // Currently ain't broke so ain't fixing it
        pool.query(`SELECT * FROM lifts WHERE userID = '${userAccount.id}' AND movement = '${movement}' ORDER BY dateval DESC`, (err, sets) => {
            if (err) console.log(`Querying error getting stats: ${err}`);
            if (sets.length < 1) {
                interaction.reply({ embeds: [new EmbedBuilder().setTitle(`No data logged for ${movement}`)] });
                return;
            }

            sets.sort((a, b) => {
                const aDate = Date.parse(a.date);
                const bDate = Date.parse(b.date);
                return aDate - bDate;
            })

            let currDate = sets[0].date;
            let dateCount = 1;

            for (let set of sets) {
                let total = Set.getSetTotal(set.movement, set.weight, set.reps, userAccount.bodyweight);

                if (set.date != currDate) {
                    currDate = set.date;
                    dateCount++;
                }

                if (dateCount < 30) {
                    thirtyDayCount++;
                    thirtyDayAvgWeight += set.weight;
                    thirtyDayAvgReps += set.reps;
                }

                if (set.weight > mostWeight) {
                    mostWeight = set.weight;
                    mostWeightDate = set.date;
                }
                if (set.reps > mostReps) {
                    mostReps = set.reps;
                    mostRepsDate = set.date;
                }

                if (total > bestTotal) {
                    bestTotal = total;
                    bestSetDate = set.date;
                    bestSetWeight = set.weight;
                    bestSetReps = set.reps;
                }
            }

            lifetimeCount = sets.length;
            thirtyDayAvgReps /= thirtyDayCount;
            thirtyDayAvgWeight /= thirtyDayCount;

            // Averages are rounded so they only display one decimal place
            let statsEmbed = new EmbedBuilder()
                .setTitle(`${this.name}'s ${movement}`)
                .addFields({ name: "\0", value: "**__30 Day__**" })
                .addFields({ name: "Average Weight", value: `${Math.round(thirtyDayAvgWeight * 10) / 10}lbs`, inline: true })
                .addFields({ name: "Average Reps", value: `${Math.round(thirtyDayAvgReps * 10) / 10}`, inline: true })
                .addFields({ name: "\0", value: "**__Records__**" })
                .addFields({ name: "Most Weight", value: `${mostWeight}lbs on ${mostWeightDate}`, inline: true })
                .addFields({ name: "Most Reps", value: `${mostReps} reps on ${mostRepsDate}`, inline: true })
                .addFields({ name: "Best Set", value: `${bestSetWeight}lbs x ${bestSetReps} reps = ${bestTotal} on ${bestSetDate}`, inline: true })
                .setFooter({ text: `Total Sets: ${lifetimeCount}\nSets recorded in the last 30 days: ${thirtyDayCount}`})

            interaction.reply({ embeds: [statsEmbed] });
            console.log(`${interaction.user.username} fetched stats for their ${movement}.`);
        });
    }
}