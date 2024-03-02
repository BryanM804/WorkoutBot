const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "squat",
    description: "Save your one rep max squat record.",
    options: [
        {
            name: "weight",
            description: "Weight of your one rep max squat.",
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    callback: (client, interaction) => {
        let weight = interaction.options.get("weight").value;

        if (weight <= 0 || weight > 1000) {
            interaction.reply({ content: "Invalid weight.", ephemeral: true });
            console.log(`${interaction.user.username} tried to set their squat to ${weight}`);
        } else {
            findAccount(interaction.user.username, interaction.user.id).setSquat(weight);
            interaction.reply(`Set your squat to ${weight}lbs.`);
            console.log(`${interaction.user.username} set squat to ${weight}lbs.`);
        }
    }
}