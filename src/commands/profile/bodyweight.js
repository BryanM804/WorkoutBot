const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "bodyweight",
    description: "Set your body weight to gain xp from bodyweight and assisted exercises.",
    deleted: true,
    options: [
        {
            name: "weight",
            description: "Your body weight.",
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    callback: (client, interaction) => {
        let weight = interaction.options.get("weight").value;

        if (weight <= 0 || weight > 1000) {
            interaction.reply({ content: "Invalid weight.", ephemeral: true });
            console.log(`${interaction.user.username} tried to set their body weight to ${weight}`);
        } else {
            findAccount(interaction.user.username, interaction.user.id).setBodyweight(weight);
            interaction.reply(`Set your body weight to ${weight}lbs.`);
            console.log(`${interaction.user.username} set body weight to ${weight}lbs.`)
        }
    }
}