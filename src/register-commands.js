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
        description: "Get your history log up to 30 days",
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
        description: "See your profile information"
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