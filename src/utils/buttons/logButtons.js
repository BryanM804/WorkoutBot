const { findAccount } = require("../..")
const generateReplyString = require("../generateLogReplyString");
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = async (interaction, movement, weight, reps, sets, date) => {
    const userAccount = findAccount(interaction.user.username, interaction.user.id);

    // Building buttons and action row
    const repeatButton = new ButtonBuilder()
        .setCustomId("repeat")
        .setLabel("🔁Repeat")
        .setStyle(ButtonStyle.Primary);

    const undoButton = new ButtonBuilder()
        .setCustomId("undo")
        .setLabel("🗑️Undo")
        .setStyle(ButtonStyle.Danger);

    // Reps options
    const sub1 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(reps - 1 < 0) ? 0 : reps - 1} reps`)
        .setValue("-1");
    const sub2 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(reps - 2 < 0) ? 0 : reps - 2} reps`)
        .setValue("-2");
    const sub3 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(reps - 3 < 0) ? 0 : reps - 3} reps`)
        .setValue("-3");
    const add1 = new StringSelectMenuOptionBuilder()
        .setLabel(`${reps + 1} reps`)
        .setValue("1");
    const add2 = new StringSelectMenuOptionBuilder()
        .setLabel(`${reps + 2} reps`)
        .setValue("2");
    const add3 = new StringSelectMenuOptionBuilder()
        .setLabel(`${reps + 3} reps`)
        .setValue("3");

    const repsSelect = new StringSelectMenuBuilder()
        .setCustomId("repSelect")
        .setPlaceholder("Rep Change?")
        .addOptions(sub1, sub2, sub3, add1, add2, add3);

    // Weight options
    const sub5 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(weight - 5 < 0) ? 0 : (weight - 5)} lbs`)
        .setValue("-5");
    const sub10 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(weight - 10 < 0) ? 0 : (weight - 10)} lbs`)
        .setValue("-10");
    const sub15 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(weight - 15 < 0) ? 0 : (weight - 15)} lbs`)
        .setValue("-15");
    const add5 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(weight + 5)} lbs`)
        .setValue("5");
    const add10 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(weight + 10)} lbs`)
        .setValue("10");
    const add15 = new StringSelectMenuOptionBuilder()
        .setLabel(`${(weight + 15)} lbs`)
        .setValue("15");

    const weightSelect = new StringSelectMenuBuilder()
        .setCustomId("weightSelect")
        .setPlaceholder("Weight Change?")
        .addOptions(sub5, sub10, sub15, add5, add10, add15);

    const buttonRow = new ActionRowBuilder()
        .addComponents(repeatButton)
        .addComponents(undoButton)
    const repRow = new ActionRowBuilder()
        .addComponents(repsSelect);
    const weightRow = new ActionRowBuilder()
        .addComponents(weightSelect);

    let repChange = 0;
    let weightChange = 0;
    let messageContents = generateReplyString(movement, weight, reps, sets, date);

    const buttonResponse = await interaction.reply({ content: messageContents + ".", components: [repRow, weightRow, buttonRow] });

    const stringCollector = buttonResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect })
    const buttonCollector = buttonResponse.createMessageComponentCollector({ componentType: ComponentType.Button })

    stringCollector.on("collect", async i => {
        if (i.customId == "repSelect") {
            repChange = parseInt(i.values[0]);
            console.log(`Rep change: ${repChange}`);
        } else if (i.customId == "weightSelect") {
            weightChange = parseInt(i.values[0]);
            console.log(`Weight change: ${weightChange}`);
        }
    })

    buttonCollector.on("collect", async i => {
        if (i.customId == "undo") {
            userAccount.undoSet(1, (undid) => {
                console.log(`${interaction.user.username} undid 1 set.`);
                if (messageContents.indexOf("\n") != -1) {
                    messageContents = messageContents.substring(0, messageContents.lastIndexOf("\n"));
                    interaction.editReply({ content: messageContents });
                } else {
                    interaction.editReply({ content: "Successfully undid set.", components: [] });
                }
            })
        } else if (i.customId == "repeat") {
            const oldLevel = userAccount.level;
                weight += weightChange;
                reps += repChange;

            userAccount.repeatSet(weight, reps, 1, () => {
                if (userAccount.level > oldLevel) {
                    interaction.channel.send(`${interaction.user} has leveled up to level ${userAccount.level}!`);
                }

                // Gui resets selection every submission
                repChange = 0;
                weightChange = 0;

                console.log(`${interaction.user.username} repeated ${movement} ${weight} lbs x ${reps}`);
                messageContents += "\n" + generateReplyString(movement, weight, reps, 1);
                
                sub5.setLabel(`${(weight - 5 < 0) ? 0 : (weight - 5)} lbs`);
                sub10.setLabel(`${(weight - 10 < 0) ? 0 : (weight - 10)} lbs`);
                sub15.setLabel(`${(weight - 15 < 0) ? 0 : (weight - 15)} lbs`);
                add5.setLabel((weight + 5) + " lbs");
                add10.setLabel((weight + 10) + " lbs");
                add15.setLabel((weight + 15) + " lbs");

                weightSelect.setOptions(sub5, sub10, sub15, add5, add10, add15);
                weightRow.setComponents(weightSelect);

                sub1.setLabel(`${(reps - 1 < 0) ? 0 : reps - 1} reps`);
                sub2.setLabel(`${(reps - 2 < 0) ? 0 : reps - 2} reps`);
                sub3.setLabel(`${(reps - 3 < 0) ? 0 : reps - 3} reps`);
                add1.setLabel(`${reps + 1} reps`);
                add2.setLabel(`${reps + 2} reps`);
                add3.setLabel(`${reps + 3} reps`);

                repsSelect.setOptions(sub1, sub2, sub3, add1, add2, add3);
                repRow.setComponents(repsSelect);

                interaction.editReply({ content: messageContents, components: [repRow, weightRow, buttonRow] });
            })
        }
    })
}