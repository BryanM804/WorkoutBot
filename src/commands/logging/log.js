const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");
const logButtons = require("../../utils/buttons/logButtons.js");

module.exports = {
    name: "log",
    description: "Log movements for the day.",
    options: [
        {
            name: "movement",
            description: "Type of movement.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: "weight",
            description: "Amount of weight you used.",
            type: ApplicationCommandOptionType.Number
        },
        {
            name: "reps",
            description: "Amount of reps you did.",
            type: ApplicationCommandOptionType.Integer
        },
        {
            name: "sets",
            description: "Number of sets you did (if you are logging multiple sets at the same weight and reps.)",
            type: ApplicationCommandOptionType.Integer
        },
        {
            name: "date",
            description: "Enter date if you wish to log on a previous date.",
            type: ApplicationCommandOptionType.String
        }
    ],
    callback: async (client, interaction) => {
        const userAccount = findAccount(interaction.user.username, interaction.user.id);

        const movement = interaction.options.get("movement").value;
        let weight = interaction.options.get("weight")?.value ?? 0;
        let reps = interaction.options.get("reps")?.value ?? 0;
        const sets = interaction.options.get("sets")?.value ?? 1;
        const date = interaction.options.get("date")?.value ? new Date(Date.parse(interaction.options.get("date")?.value)).toDateString() : null;

        if (weight > 2000 || reps > 100 || sets > 50 || weight < 0 || reps < 0 || sets <= 0 || date == "Invalid Date") {
            interaction.reply({ content: "Invalid input.", ephemeral: true });
            console.log(`${interaction.user.username} tried to log ${movement} ${weight}lbs ${reps} reps for ${sets} sets.`);
        } else {
            console.log(`${interaction.user.username} Logged: ${movement} ${weight} lbs ${reps} reps for ${sets} sets.`);

            let tempAccount = findAccount(interaction.user.username, interaction.user.id)
            let prevLvl = tempAccount.level;

            let callNum = 1;
            for (let i = 0; i < sets; i++) {
                tempAccount.logSet(movement, weight, reps, date, () => {
                    if (tempAccount.level > prevLvl) {
                        if (callNum === sets)
                            interaction.channel.send(`${interaction.user} has leveled up to level ${tempAccount.level}!`);
                        else
                            callNum++;
                    }
                });
            }

            logButtons(interaction, movement, weight, reps, sets, date);
        }
    }
}