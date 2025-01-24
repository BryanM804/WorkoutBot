const { findAccount } = require("../index")
const generateReplyString = require("../utils/generateLogReplyString");
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
    const defaultReps = new StringSelectMenuOptionBuilder().setValue("0");
    const sub1 = new StringSelectMenuOptionBuilder().setValue("-1");
    const sub2 = new StringSelectMenuOptionBuilder().setValue("-2");
    const sub3 = new StringSelectMenuOptionBuilder().setValue("-3");
    const add1 = new StringSelectMenuOptionBuilder().setValue("1");
    const add2 = new StringSelectMenuOptionBuilder().setValue("2");
    const add3 = new StringSelectMenuOptionBuilder().setValue("3");

    const repsSelect = new StringSelectMenuBuilder().setCustomId("repSelect");

    // Updates the reps labels to be relative to the last logged set
    function updateReps() {
        defaultReps.setLabel(`${reps} reps`);
        sub1.setLabel(`${(reps - 1 < 0) ? 0 : reps - 1} reps`);
        sub2.setLabel(`${(reps - 2 < 0) ? 0 : reps - 2} reps`);
        sub3.setLabel(`${(reps - 3 < 0) ? 0 : reps - 3} reps`);
        add1.setLabel(`${reps + 1} reps`);
        add2.setLabel(`${reps + 2} reps`);
        add3.setLabel(`${reps + 3} reps`);
        repsSelect.setPlaceholder(`${reps} reps`);
        repsSelect.setOptions();

        const options = [sub1, sub2, sub3]
        let subtract = 1;

        // Options that are below zero would allow for negative reps even though the display is 0
        for (const option of options) {
            if (reps - subtract >= 0) {
                repsSelect.addOptions(option);
            }
            
            subtract += 1;
        }

        repsSelect.addOptions(defaultReps, add1, add2, add3);
    }
    updateReps();

    // Weight options
    const defaultWeight = new StringSelectMenuOptionBuilder().setValue("0");
    const sub5 = new StringSelectMenuOptionBuilder().setValue("-5");
    const sub10 = new StringSelectMenuOptionBuilder().setValue("-10");
    const sub15 = new StringSelectMenuOptionBuilder().setValue("-15");
    const sub20 = new StringSelectMenuOptionBuilder().setValue("-20");
    const add5 = new StringSelectMenuOptionBuilder().setValue("5");
    const add10 = new StringSelectMenuOptionBuilder().setValue("10");
    const add15 = new StringSelectMenuOptionBuilder().setValue("15");
    const add20 = new StringSelectMenuOptionBuilder().setValue("20");

    const weightSelect = new StringSelectMenuBuilder()
        .setCustomId("weightSelect");

    // Updates the weight labels to be relative to the last logged set
    function updateWeights() {
        defaultWeight.setLabel(`${weight} lbs`);
        sub5.setLabel(`${(weight - 5 < 0) ? 0 : (weight - 5)} lbs`);
        sub10.setLabel(`${(weight - 10 < 0) ? 0 : (weight - 10)} lbs`);
        sub15.setLabel(`${(weight - 15 < 0) ? 0 : (weight - 15)} lbs`);
        sub20.setLabel(`${(weight - 20 < 0) ? 0 : (weight - 20)} lbs`);
        add5.setLabel((weight + 5) + " lbs");
        add10.setLabel((weight + 10) + " lbs");
        add15.setLabel((weight + 15) + " lbs");
        add20.setLabel((weight + 20) + " lbs");
        weightSelect.setPlaceholder(`${weight} lbs`);
        weightSelect.setOptions();

        const options = [sub5, sub10, sub15, sub20];
        let subtract = 5;
        
        // Weights below zero would allow for negative weight even though they would display 0
        for (const option of options) {
            if (weight - subtract >= 0) {
                weightSelect.addOptions(option);
            }
            subtract += 5;
        }
        weightSelect.addOptions(defaultWeight, add5, add10, add15, add20);
    }
    updateWeights();

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

    // Clear buttons automatically after ~15 minutes (Max Webhook time)
    setTimeout(() => {
        interaction.editReply({ components: [] });
    }, 895000);

    const stringCollector = buttonResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect })
    const buttonCollector = buttonResponse.createMessageComponentCollector({ componentType: ComponentType.Button })

    stringCollector.on("collect", async i => {
        if (i.user.id == interaction.user.id) {
            if (i.customId == "repSelect") {
                repChange = parseInt(i.values[0]);
                console.log(`${i.user.username} rep change: ${repChange}`);
            } else if (i.customId == "weightSelect") {
                weightChange = parseInt(i.values[0]);
                console.log(`${i.user.username} weight change: ${weightChange}`);
            }
        }
    })

    buttonCollector.on("collect", async i => {
        // Undo removes 1 set at a time from the current block
        if (i.user.id == interaction.user.id) {
            if (i.customId == "undo") {
                const undid = await userAccount.undoSet(1)
                console.log(`${interaction.user.username} undid 1 set.`);
                if (messageContents.indexOf("\n") != -1) {
                    messageContents = messageContents.substring(0, messageContents.lastIndexOf("\n"));
                    interaction.editReply({ content: messageContents });
                } else {
                    interaction.editReply({ content: "Successfully undid set.", components: [] });
                }
            } else if (i.customId == "repeat") {
                const oldLevel = userAccount.level;
                    weight += weightChange;
                    reps += repChange;
    
                await userAccount.logSet(movement, weight, reps, date)
                if (userAccount.level > oldLevel) {
                    interaction.channel.send(`${interaction.user} has leveled up to level ${userAccount.level}!`);
                }

                // Gui resets selection every submission
                repChange = 0;
                weightChange = 0;

                console.log(`${interaction.user.username} repeated ${movement} ${weight} lbs x ${reps}`);
                messageContents += "\n" + generateReplyString(movement, weight, reps, 1);
                
                updateWeights();
                weightRow.setComponents(weightSelect);

                updateReps();
                repRow.setComponents(repsSelect);

                interaction.editReply({ content: messageContents, components: [repRow, weightRow, buttonRow] });
            }
        }
    })
}