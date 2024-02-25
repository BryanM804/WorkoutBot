const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "bench",
    description: "Save your one rep max bench record.",
    options: [
        {
            name: "weight",
            description: "Weight of your one rep max bench.",
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],
    callback: (client, interaction) => {
        let weight = interaction.options.get("weight").value;
        if(weight <= 0 || weight > 1000){
            interaction.reply("Invalid weight.")
        }else{
            findAccount(interaction.user.username, interaction.user.id).setBench(weight);
            interaction.reply(`Set your bench to ${weight}lbs.`);
            console.log(`${interaction.user.username} set bench to ${weight}lbs.`);
        }
    }
}