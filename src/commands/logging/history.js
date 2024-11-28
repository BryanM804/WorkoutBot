const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } = require("discord.js");
const { findAccount } = require("../../index.js");
const getHistoryEmbeds = require("../../account/getHistoryEmbeds.js");

module.exports = {
    name: "history",
    description: "Get your history log.",
    options: [
        {
            name: "date",
            description: "Specific date you want your history on.",
            type: ApplicationCommandOptionType.String
        }
    ],
    callback: (client, interaction) => {
        let startDate = interaction.options.get("date")?.value ?? null;

        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        let date;

        if (startDate) {
            date = new Date(Date.parse(startDate)).toDateString();
        } else {
            date = new Date().toDateString();
        }
        
        getHistoryEmbeds(interaction, date, async (historyEmbeds) => {
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
                if (i.user.id == interaction.user.id) {
                    // Advance the date forward or back a day depending on button
                    if (i.customId == "prevHistory") {
                        date = new Date(Date.parse(date) - 86400000).toDateString();
                    } else if (i.customId == "nextHistory") {
                        date = new Date(Date.parse(date) + 86400000).toDateString();
                    }
                    
                    getHistoryEmbeds(interaction, date, (historicalEmbedments) => {
                        interaction.editReply({ embeds: historicalEmbedments });
                    });
                }
            })

            // Clear buttons automatically after ~15 minutes (Max Webhook time)
            setTimeout(() => {
                interaction.editReply({components: []});
            }, 895000);
        });
    }
}