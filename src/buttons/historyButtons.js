const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const getHistoryEmbeds = require("../account/getHistoryEmbeds.js");

module.exports = async (interaction, historyEmbeds, date) => {
    const leftButton = new ButtonBuilder()
        .setCustomId("prevHistory")
        .setLabel("<")
        .setStyle(ButtonStyle.Primary);

    const refreshButton = new ButtonBuilder()
        .setCustomId("refresh")
        .setLabel("🔁")
        .setStyle(ButtonStyle.Primary);

    const rightButton = new ButtonBuilder()
        .setCustomId("nextHistory")
        .setLabel(">")
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder()
        .addComponents([leftButton, refreshButton, rightButton]);

    const buttonReply = await interaction.reply({ embeds: historyEmbeds, components: [buttonRow] });
    const buttonCollector = buttonReply.createMessageComponentCollector({ componentType: ComponentType.Button });

    buttonCollector.on("collect", async i => {
        // Advance the date forward or back a day depending on button
        if (i.customId == "prevHistory" && i.user.id == interaction.user.id) {
            date = new Date(Date.parse(date) - 86400000).toDateString();
        } else if (i.customId == "nextHistory" && i.user.id == interaction.user.id) {
            date = new Date(Date.parse(date) + 86400000).toDateString();
        }
        if (i.user.id == interaction.user.id) {
            getHistoryEmbeds(interaction, date, (historicalEmbedments) => {
                interaction.editReply({ embeds: historicalEmbedments });
            });
        }
    })

    // Clear buttons automatically after ~15 minutes (Max Webhook time)
    setTimeout(() => {
        interaction.editReply({components: []});
    }, 895000);
}