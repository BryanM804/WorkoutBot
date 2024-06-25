const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

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
    callback: (client, interaction) => {
        const movement = interaction.options.get("movement").value;
        const time = interaction.options.get("time").value;
        const date = interaction.options.get("date")?.value ? new Date(Date.parse(interaction.options.get("date")?.value)).toDateString() : null;
        const note = interaction.options.get("note")?.value ? interaction.options.get("note").value : "";
        const distance = interaction.options.get("distance")?.value ? interaction.options.get("distance").value.toString() : "0.0";

        if (time <= 0 || time > 1000 || date == "Invalid Date") {
            interaction.reply({ content: "Invalid input.", ephemeral: true });
            console.log(`${interaction.user.username} tried to log cardio: ${movement} for ${time} minutes.`);
        } else {
            if (note == "" && distance == "0.0") 
                console.log(`${interaction.user.username} Logged cardio: ${movement} for ${time} minutes.`);
            else if (note == "")
                console.log(`${interaction.user.username} Logged cardio: ${movement} for ${time} minutes and ${distance} miles.`);
            else if (distance == "0.0")
                console.log(`${interaction.user.username} Logged cardio: ${movement} for ${time} minutes, with note: ${note}.`);
            else
                console.log(`${interaction.user.username} Logged cardio: ${movement} for ${time} minutes and ${distance} miles, with note: ${note}.`);

            let tempAccount = findAccount(interaction.user.username, interaction.user.id)
            let prevLvl = tempAccount.level;

            tempAccount.logCardio(movement, time, date, note, distance, () => {
                if (tempAccount.level > prevLvl) {
                    interaction.channel.send(`${interaction.user} has leveled up to level ${tempAccount.level}!`);
                }
            });

            //Reply in chat (will likely change to an embed later)
            let replyString = `Logged ${movement} for ${time} minutes`;

            if (date) {
                replyString += ` on ${date}`;
            }

            interaction.reply(replyString + ".");
        }
    }
}