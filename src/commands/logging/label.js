const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");
const pool = require("../../pool.js");

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

        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        const newLabel = interaction.options.get("label").value;

        let today = new Date().toDateString();

        pool.query(`INSERT INTO labels (userID, label, date) VALUES (
            '${userAccount.id}',
            '${newLabel}',
            '${today}'
        )`, (err2, result) => {
            if (err2) {
                console.log(`Query error setting label: ${err2}`);
                interaction.reply(`Error setting label.`);
                return;
            }

            interaction.reply(`Set today's label to: ${newLabel}`);
            console.log(`${interaction.user.username} set today's label to \"${newLabel}\"`);
        })
    }
}