const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "deadlift",
    description: "Save your one rep max deadlift record.",
    options: [
        {
            name: "weight",
            description: "Weight of your one rep max deadlift.",
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    callback: (client, interaction) => {
        let weight = interaction.options.get("weight").value;

        if (weight <= 0 || weight > 1000) {
            interaction.reply({ content: "Invalid weight.", ephemeral: true });
            console.log(`${interaction.user.username} tried to set their deadlift to ${weight}`);
        } else {
            findAccount(interaction.user.username, interaction.user.id).setDeadlift(weight);
            interaction.reply(`Set your deadlift to ${weight}lbs.`);
            console.log(`${interaction.user.username} set deadlift to ${weight}lbs.`);
        }
    }
}