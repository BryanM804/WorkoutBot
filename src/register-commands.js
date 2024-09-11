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
        description: "Get your history log up to 7 days",
        options: [
            {
                name: "days",
                description: "Amount of days back you want to go.",
                type: ApplicationCommandOptionType.Integer
            },
            {
                name: "date",
                description: "Specific date you want your history on.",
                type: ApplicationCommandOptionType.String
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
        name: "squat",
        description: "Save your one rep max squat record.",
        options: [
            {
                name: "weight",
                description: "Weight of your one rep max squat.",
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    },
    {
        name: "bench",
        description: "Save your one rep max bench record.",
        options: [
            {
                name: "weight",
                description: "Weight of your one rep max bench.",
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    },
    {
        name: "deadlift",
        description: "Save your one rep max deadlift record.",
        options: [
            {
                name: "weight",
                description: "Weight of your one rep max deadlift.",
                type: ApplicationCommandOptionType.Number,
                required: true
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
                        name: "Cardio Total",
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

        ]
    },
    {
        name: "bodyweight",
        description: "Set your body weight to gain xp from bodyweight and assisted exercises.",
        options: [
            {
                name: "weight",
                description: "Your body weight.",
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    },
    {
        name: "label",
        description: "Set a label for the current day.",
        options: [
            {
                name: "label",
                description: "Label for the day",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: "undo",
        description: "Removes the last set you logged.",
        options: [
            {
                name: "sets",
                description: "Number of sets to undo",
                type: ApplicationCommandOptionType.Integer
            }
        ]
    },
    {
        name: "repeat",
        description: "Log a duplicate of the last set you logged.",
        options: [
            {
                name: "sets",
                description: "Number of times to repeat.",
                type: ApplicationCommandOptionType.Integer
            }
        ]
    }

];

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

(async () => {
    try{
        console.log("Registering Commands...");

        await(rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: commands}))

        console.log("Commands registered successfully!");
    }catch(error){
        console.log(`ERROR: ${error}`);
    }
})();