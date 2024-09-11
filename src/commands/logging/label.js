const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");

module.exports = {
    name: "label",
    description: "Set a label for the current day.",
    options: [
        {
            name: "label",
            description: "Label for the day",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    callback: (client, interaction) => {
        // This needs a fix for when a user makes a label with an apostrophe

        let userAccount = findAccount(interaction.user.username, interaction.user.id);

        userAccount.setDayLabel(interaction.options.get("label").value, (success) => {
            if (success) {
                interaction.reply(`Set today's label to: ${interaction.options.get("label").value}`);
                console.log(`${interaction.user.username} set today's label to ${interaction.options.get("label").value}`);
            }
        });
            //interaction.reply({ content: "No log for today, nothing to label.", ephemeral: true });
            //console.log(`${interaction.user.username} tried to set a label for today but has no log.`);
    }
}