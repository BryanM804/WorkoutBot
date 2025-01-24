const { ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require("discord.js");
const { findAccount } = require("../../index.js");
const getGraphMessage = require("../../utils/getGraphMessage.js");

module.exports = {
    name: "graph",
    description: "Generate graphs of your lifting data. (Using \"Today\" overrides the type of graph)",
    options: [
        {
            name: "movement",
            description: "Type of movement.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: "type",
            description: "Type of graph.",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Average Set",
                    value: "sets"
                },
                {
                    name: "Strength",
                    value: "strength"
                },
                {
                    name: "Best Set per Day",
                    value: "best"
                }
            ]
        },
        {
            name: "timeframe",
            description: "Period of time to graph.",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "All",
                    value: "all"
                },
                {
                    name: "Recent",
                    value: "recent"
                },
                {
                    name: "Today",
                    value: "today"
                }
            ]
        }
    ],
    callback: async (client, interaction) => {
        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        const movement = interaction.options.get("movement").value;
        let type = interaction.options.get("type")?.value ? interaction.options.get("type").value : "sets";
        let timeframe = interaction.options.get("timeframe")?.value ? interaction.options.get("timeframe").value : "all";

        const reply = await getGraphMessage(userAccount, movement, type, timeframe)
        const typeMenu = new StringSelectMenuBuilder()
            .setCustomId("type")
            .setPlaceholder("Change Type");
        const timeMenu = new StringSelectMenuBuilder()
            .setCustomId("time")
            .setPlaceholder("Change Time");
        const types = ["sets", "strength", "best"];
        const typeLabels = ["Average Set", "Strength", "Best Set"];
        const times = ["all", "recent", "today"];
        const timeLabels = ["All", "Recent", "Today"];
        for (let i = 0; i < types.length; i++) {
            typeMenu.addOptions(new StringSelectMenuOptionBuilder()
                .setValue(types[i])
                .setLabel(typeLabels[i]));
            timeMenu.addOptions(new StringSelectMenuOptionBuilder()
                .setValue(times[i])
                .setLabel(timeLabels[i]));
        }

        const typeRow = new ActionRowBuilder().addComponents(typeMenu);
        const timeRow = new ActionRowBuilder().addComponents(timeMenu);

        const messageInteraction = await interaction.reply({...reply, components: [typeRow, timeRow]});
        const stringCollector = messageInteraction.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

        stringCollector.on("collect", async i => {
            if (i.user.id == interaction.user.id) {
                if (i.customId == "type")
                    type = i.values[0];
                else if (i.customId == "time")
                    timeframe = i.values[0];

                const newReply = await getGraphMessage(userAccount, movement, type, timeframe);
                interaction.editReply(newReply);
            }
        })

        // Clear buttons automatically after ~15 minutes (Max Webhook time)
        setTimeout(() => {
            interaction.editReply({components: []});
        }, 895000);
    }
}