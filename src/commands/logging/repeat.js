const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

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
        let prevLevel = userAccount.getLevel();

        userAccount.repeatSet(weight ? weight : undefined, reps ? reps : undefined, repeats, (lastSet) => {
                if (userAccount.getLevel() > prevLevel) {
                    interaction.channel.send(`${interaction.user} has leveled up to level ${userAccount.getLevel()}!`);
                }

            if(lastSet){
                if (repeats > 1 && lastSet.getWeight() >= 1) {
                    interaction.reply(`Logged ${repeats} sets of ${lastSet.getMovement()} ${lastSet.getWeight()}lbs for ${lastSet.getReps()} reps.`);
                    console.log(`${interaction.user.username} repeated: ${repeats} sets of ${lastSet.getMovement()} ${lastSet.getWeight()}lbs for ${lastSet.getReps()} reps.`);
                } else if (repeats > 1) {
                    interaction.reply(`Logged ${repeats} sets of ${lastSet.getMovement()} for ${lastSet.getReps()} reps.`);
                    console.log(`${interaction.user.username} repeated: ${repeats} sets of ${lastSet.getMovement()} for ${lastSet.getReps()} reps.`);
                } else if (lastSet.getWeight() >= 1) {
                    interaction.reply(`Logged ${lastSet.getMovement()} ${lastSet.getWeight()}lbs for ${lastSet.getReps()} reps.`);
                    console.log(`${interaction.user.username} repeated: ${lastSet.getMovement()} ${lastSet.getWeight()}lbs for ${lastSet.getReps()} reps.`);
                } else {
                    interaction.reply(`Logged ${lastSet.getMovement()} for ${lastSet.getReps()} reps.`);
                    console.log(`${interaction.user.username} repeated: ${lastSet.getMovement()} for ${lastSet.getReps()} reps.`);
                }
            }else{
                interaction.reply({ content: "No previous set to repeat for today.", ephemeral: true });
                console.log(`${interaction.user.username} tried to repeat ${repeats} set(s) but has not logged one today.`);
            }
        });
    }
}