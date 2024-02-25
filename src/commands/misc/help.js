const { HelpEmbed } = require("..\\..\\utils\\Embeds.js");

module.exports = {
    name: "help",
    description: "Explains how to use the bot.",
    //devOnly: boolean,
    //testOnly: boolean,
    //deleted: boolean,
    callback: (client, interaction) => {
        interaction.reply({ embeds: [HelpEmbed] });
    }
}