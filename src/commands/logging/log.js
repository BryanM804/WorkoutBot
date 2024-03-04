const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

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
    callback: (client, interaction) => {
        const movement = interaction.options.get("movement").value;
        const weight = interaction.options.get("weight")?.value ?? 0;
        const reps = interaction.options.get("reps")?.value ?? 0;
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

            //Reply in chat (will likely change to an embed later)
            let replyString = "";

            if (sets > 1 && weight >= 1) {
                replyString = `Logged ${sets} sets of ${movement} ${weight}lbs for ${reps} reps`;
            } else if (sets > 1) {
                replyString = `Logged ${sets} sets of ${movement} for ${reps} reps`;
            } else if (weight >= 1) {
                replyString = `Logged ${movement} ${weight}lbs for ${reps} reps`;
            } else {
                replyString = `Logged ${movement} for ${reps} reps`;
            }

            if (date) {
                replyString += ` on ${date}`;
            }

            interaction.reply(replyString + ".");
        }
    }
}