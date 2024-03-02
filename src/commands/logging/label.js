const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "label",
    description: "Set a label for the current day.",
    deleted: true,
    options: [
        {
            name: "label",
            description: "Label for the day",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    callback: (client, interaction) => {
        let userAccount = findAccount(interaction.user.username, interaction.user.id);

        if (userAccount.setDayLabel(interaction.options.get("label").value)) {
            interaction.reply(`Set today's label to: ${interaction.options.get("label").value}`);
            console.log(`${interaction.user.username} set today's label to ${interaction.options.get("label").value}`);
        } else {
            interaction.reply({ content: "No log for today, nothing to label.", ephemeral: true });
            console.log(`${interaction.user.username} tried to set a label for today but has no log.`);
        }
    }
}