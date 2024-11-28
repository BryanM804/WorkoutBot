const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");
const logButtons = require("../../buttons/logButtons.js");

module.exports = {
    name: "repeat",
    description: "Log a duplicate of the last set you logged.",
    options: [
        {
            name: "reps",
            description: "Number of reps.",
            type: ApplicationCommandOptionType.Integer
        },
        {
            name: "weight",
            description: "Amount of weight used",
            type: ApplicationCommandOptionType.Number
        },
        {
            name: "sets",
            description: "Number of times to repeat.",
            type: ApplicationCommandOptionType.Integer
        }
    ],
    callback: (client, interaction) => {
        let userAccount = findAccount(interaction.user.username, interaction.user.id);
        const repeats = interaction.options.get("sets")?.value ?? 1;
        const weight = interaction.options.get("weight")?.value;
        const reps = interaction.options.get("reps")?.value;
        let prevLevel = userAccount.level;

        userAccount.repeatSet(weight ? weight : undefined, reps ? reps : undefined, repeats, (lastSet) => {
                if (userAccount.level > prevLevel) {
                    interaction.channel.send(`${interaction.user} has leveled up to level ${userAccount.level}!`);
                }

            if(lastSet){
                logButtons(interaction, lastSet.movement, lastSet.weight, lastSet.reps, repeats, lastSet.date);
            }else{
                interaction.reply({ content: "No previous set to repeat for today.", ephemeral: true });
                console.log(`${interaction.user.username} tried to repeat ${repeats} set(s) but has not logged one today.`);
            }
        });
    }
}