const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { findAccount, sortAccounts } = require("../../index.js");

module.exports = {
    name: "leaderboard",
    description: "Leaderboard sorted by level by default.",
    options: [
        {
            name: "stat",
            description: "Statistic to sort by.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "Level",
                    description: "Account level",
                    value: "Level"
                },
                {
                    name: "Days Skipped",
                    description: "Total days skipped",
                    value: "Days Skipped"
                },
                {
                    name: "Current Skip Streak",
                    value: "Skip Streak"
                },
                {
                    name: "Days Logged",
                    description: "Total number of days logged",
                    value: "Days Logged"
                },
                {
                    name: "Cardio Total (WIP)",
                    description: "Total minutes of cardio done",
                    value: "Cardio Total"
                },
                {
                    name: "Date Created",
                    description: "Account creation date",
                    value: "Date Created"
                },
                {
                    name: "Squat",
                    description: "Squat one rep max",
                    value: "Squat"

                },
                {
                    name: "Bench",
                    description: "Bench one rep max",
                    value: "Bench"

                },
                {
                    name: "Deadlift",
                    description: "Deadlift one rep max",
                    value: "Deadlift"

                },
                {
                    name: "Powerlifting Total",
                    description: "Total of squat, bench, and deadlift",
                    value: "Powerlifting Total"
                }
            ]
        }

    ],
    callback: (client, interaction) => {
        let leaderBoardEmbed = new EmbedBuilder()
        .setTitle(`Leaderboard`)
        .setDescription(`Sorted by ${interaction.options.get("stat").value}`);

        sortAccounts(interaction.options.get("stat").value, (accounts) => {
            let number = 0;
            
            for (let i = 0; i < accounts.length; i++) {
                if (i >= 25) break; // Can't have more than 25 fields in one embed
                
                number++;
                switch(interaction.options.get("stat").value){
                    case "Level":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Level: ${accounts[i].level}` });
                        break;
                    case "Days Skipped":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Days Skipped: ${accounts[i].skipTotal}` });
                        break;
                    case "Skip Streak":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Skip Streak: ${accounts[i].skipStreak}` });
                        break;
                    case "Days Logged":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Days Logged: ${accounts[i].totalDays}` });
                        break;
                    case "Cardio Total":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Cardio Total: ${accounts[i].name} minutes` });
                        break;
                    case "Date Created":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Date Created: ${accounts[i].creationDate}` });
                        break;
                    case "Squat":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Squat: ${accounts[i].squat}` });
                        break;
                    case "Bench":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Bench: ${accounts[i].bench}` });
                        break;
                    case "Deadlift":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Deadlift: ${accounts[i].deadlift}` });
                        break;
                    case "Powerlifting Total":
                        leaderBoardEmbed.addFields({ name: `${number}. ${accounts[i].name}`, value: `Total: ${accounts[i].getTotal()}` });
                        break;
                }
            }

            interaction.reply({ embeds: [leaderBoardEmbed] });
            console.log(`${interaction.user.username} fetched leaderboard sorted by ${interaction.options.get("stat").value}.`);
        });
    }
}