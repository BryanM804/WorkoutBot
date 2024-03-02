const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "undo",
    description: "Removes the last set you logged.",
    options: [
        {
            name: "sets",
            description: "Number of sets to undo",
            type: ApplicationCommandOptionType.Integer
        }
    ],
    callback: (client, interaction) => {
        let userAccount = findAccount(interaction.user.username, interaction.user.id);
        let removeSets = interaction.options.get("sets")?.value ?? 1;

        userAccount.undoSet(removeSets, (undid) => {
            if (undid) {
                if(removeSets > 1)
                    interaction.reply(`Successfully undid ${removeSets} sets`);
                else
                    interaction.reply("Successfully undid set.");

                console.log(`${interaction.user.username} undid ${removeSets} sets.`)
            }else{
                interaction.reply({ content: "No logged sets left to undo today.", ephemeral: true });
                console.log(`${interaction.user.username} tried to undo sets but has no sets logged today.`)
            }
        });
    }
}