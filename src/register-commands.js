require("dotenv").config()
const {REST, Routes, ApplicationCommandOptionType, Application, ApplicationCommand} = require("discord.js");

const commands = [
    {
        name: "help",
        description: "Explains how to use the bot."
    },
    {
        name: "log",
        description: "Log movements for the day.",
        options: [
            {
                name: "movement",
                description: "Type of movement.",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            },
            {
                name: "weight",
                description: "Amount of weight you used.",
                type: ApplicationCommandOptionType.Number
            },
            {
                name: "reps",
                description: "Amount of reps you did.",
                type: ApplicationCommandOptionType.Integer
            },
            {
                name: "sets",
                description: "Number of sets you did (if you are logging multiple sets at the same weight and reps.)",
                type: ApplicationCommandOptionType.Integer
            }
        ]
    },
    {
        name: "cardio",
        description: "Log cardio for the day.",
        options: [
            {
                name: "time",
                description: "Time (in minutes) you did cardio for.",
                type: ApplicationCommandOptionType.Number,
                required: true
            },
            {
                name: "type",
                description: "Type of cardio you did if you choose to specify.",
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    {
        name: "history",
        description: "Get your history log up to 25 days",
        options: [
            {
                name: "days",
                description: "Amount of days back you want to go.",
                type: ApplicationCommandOptionType.Integer
            }
        ]
    },
    {
        name: "profile",
        description: "See your profile information.",
        options: [
            {
                name: "user",
                description: "See another users's profile",
                type: ApplicationCommandOptionType.User
            }
        ]
    },
    {
        name: "stats",
        description: "See statistics for a specific movement.",
        options: [
            {
                name: "movement",
                description: "Type of movement.",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            }
        ]
    },
    {
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
        ]
    },
    {
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
                        value: "Level"
                    },
                    {
                        name: "Days Skipped",
                        value: "Days Skipped"
                    },
                    {
                        name: "Current Skip Streak",
                        value: "Skip Streak"
                    },
                    {
                        name: "Days Logged",
                        value: "Days Logged"
                    },
                    {
                        name: "Cardio Total",
                        value: "Cardio Total"
                    },
                    {
                        name: "Date Created",
                        value: "Date Created"
                    }
                ]
            }

        ]
    }

];

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

(async () => {
    try{
        console.log("Registering Commands...");

        await(rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: commands}))

        console.log("Commands registered successfully!");
    }catch(error){
        console.log(`ERROR: ${error}`);
    }
})();