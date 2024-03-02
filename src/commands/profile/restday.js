const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "restday",
    description: "Save/unsave your programmed rest days so they don't count as skips.",
    options: [
        {
            name: "day",
            description: "Day of the week.",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            choices: [
                {
                    name: "Sunday",
                    value: 0
                },
                {
                    name: "Monday",
                    value: 1
                },
                {
                    name: "Tuesday",
                    value: 2
                },
                {
                    name: "Wednesday",
                    value: 3
                },
                {
                    name: "Thursday",
                    value: 4
                },
                {
                    name: "Friday",
                    value: 5
                },
                {
                    name: "Saturday",
                    value: 6
                }
            ]
        }
    ],
    callback: (client, interaction) => {
        const userAccount = findAccount(interaction.user.username, interaction.user.id);
        let currentDays = userAccount.restDays;
        let chosenDay = "";

        switch(interaction.options.get("day").value){
            case 0:
                chosenDay = "Sunday";
                break;
            case 1:
                chosenDay = "Monday";
                break;
            case 2:
                chosenDay = "Tuesday";
                break;
            case 3:
                chosenDay = "Wednesday";
                break;
            case 4:
                chosenDay = "Thursday";
                break;
            case 5:
                chosenDay = "Friday";
                break;
            case 6:
                chosenDay = "Saturday";
                break;
        }

        let removed = false;
        for (let i = 0; i < currentDays.length; i++) {
            if (parseInt(currentDays[i]) == interaction.options.get("day").value) {
                currentDays.splice(i,1)
                userAccount.setRestDays(currentDays);
                interaction.reply(`Removed ${chosenDay} from your rest days.`);
                console.log(`${interaction.user.username} removed ${chosenDay} from rest days.`);
                removed = true;
                break;
            }
        }
        if (!removed) {
            currentDays.push(interaction.options.get("day").value);
            userAccount.setRestDays(currentDays);
            interaction.reply(`Added ${chosenDay} to your rest days.`);
            console.log(`${interaction.user.username} added ${chosenDay} to rest days.`);
        }
    }
}