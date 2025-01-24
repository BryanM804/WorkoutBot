const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");

module.exports = {
    name: "cardio",
    description: "Log cardio.",
    options: [
        {
            name: "movement",
            description: "Type of movement",
            type: ApplicationCommandOptionType.String,
            required: true,
            // autocomplete: true
        },
        {
            name: "time",
            description: "How long you did cardio for (in minutes)",
            type: ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "date",
            description: "Enter date if you wish to log cardio on a previous date",
            type: ApplicationCommandOptionType.String
        },
        {
            name: "note",
            description: "Any additional notes you would like to add",
            type: ApplicationCommandOptionType.String
        },
        {
            name: "distance",
            description: "Distance (in miles) if applicable",
            type: ApplicationCommandOptionType.Number
        }
    ],
    callback: async (client, interaction) => {
        const movement = interaction.options.get("movement").value;
        const time = interaction.options.get("time").value;
        const date = interaction.options.get("date")?.value ? new Date(Date.parse(interaction.options.get("date")?.value)).toDateString() : null;
        const note = interaction.options.get("note")?.value ? interaction.options.get("note").value : "";
        const distance = interaction.options.get("distance")?.value ? interaction.options.get("distance").value.toString() : "0.0";
        let replyString;

        if (time <= 0 || time > 1000 || date == "Invalid Date") {
            interaction.reply({ content: "Invalid input.", ephemeral: true });
            console.log(`${interaction.user.username} tried to log cardio: ${movement} for ${time} minutes.`);
        } else {
            if (note == "" && distance == "0.0") 
                replyString = `Logged ${movement} for ${time} minutes`;
            else if (note == "")
                replyString = `Logged ${movement} for ${time} minutes and ${distance} miles`;
            else if (distance == "0.0")
                replyString = `Logged ${movement} for ${time} minutes\n- ${note}`;
            else
                replyString = `Logged ${movement} for ${time} minutes and ${distance} miles\n- ${note}`;

            let tempAccount = findAccount(interaction.user.username, interaction.user.id)
            let prevLvl = tempAccount.level;

            await tempAccount.logCardio(movement, time, date, note, distance)
            //Reply in chat (will likely change to an embed later)

            if (date) {
                replyString += ` on ${date}`;
            }
            replyString += `.`;

            console.log(`${interaction.user.username} cardio: ${replyString}`);

            interaction.reply(replyString);

            if (tempAccount.level > prevLvl) {
                interaction.channel.send(`${interaction.user} has leveled up to level ${tempAccount.level}!`);
            }
        }
    }
}