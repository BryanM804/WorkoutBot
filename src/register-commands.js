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
                choices: [
                    {
                        name: "Barbell Bench Press",
                        value: "BBbench"
                    },
                    {
                        name: "Dumbbell Bench Press",
                        value: "DBBench"
                    },
                    {
                        name: "Chest Press Machine",
                        value: "MachinePress"
                    },
                    {
                        name: "Incline Barbell Bench Press",
                        value: "InclineBench"
                    },
                    {
                        name: "Incline Dumbbell Bench Press",
                        value: "InclineDB"
                    },
                    {
                        name: "Incline Press Machine",
                        value: "MachineIncline"
                    },
                    {
                        name: "Dip",
                        value: "Dip"
                    },
                    {
                        name: "Assissted Dip",
                        value: "DipAss"
                    },
                    {
                        name: "Barbell Shoulder Press/Military Press",
                        value: "MPress"
                    },
                    {
                        name: "Dumbbell Shoulder Press",
                        value: "DBShoulder"
                    },
                    {
                        name: "Shoulder Press Machine",
                        value: "MachineShoulder"
                    },
                    {
                        name: "Lateral Raise",
                        value: "LR"
                    },
                    {
                        name: "Lateral Raise Machine",
                        value: "MachineLR"
                    },
                    {
                        name: "Front Shoulder Raise",
                        value: "FRaise"
                    },
                    {
                        name: "Lat Pulldown",
                        value: "LPull"
                    },
                    {
                        name: "Pull up",
                        value: "Pullup"
                    },
                    {
                        name: "Assissted Pullup",
                        value: "PUpAss"
                    },
                    {
                        name: "Lat Pullover",
                        value: "LPullover"
                    },
                    {
                        name: "Barbell Row",
                        value: "BBRow"
                    },
                    {
                        name: "Machine Row",
                        value: "MachineRow"
                    },
                    {
                        name: "Machine Pulldown",
                        value: "MachinePull"
                    },
                    {
                        name: "Barbell Squat",
                        value: "BBSquat"
                    },
                    {
                        name: "Leg Extension",
                        value: "lxt"
                    },
                    {
                        name: "Hamstring Curl",
                        value: "hsCurl"
                    },
                    {
                        name: "Deadlift",
                        value: "DL"
                    },
                    {
                        name: "Tricep Pulldown",
                        value: "TPull"
                    },
                    {
                        name: "Tricep Pushdown",
                        value: "TPush"
                    },
                    {
                        name: "Tricep Machine",
                        value: "MachineTri"
                    },
                    {
                        name: "Dumbbell Bicep Curl",
                        value: "DBCurl"
                    },
                    {
                        name: "Dumbbell Hammer Curl",
                        value: "DBHammer"
                    },
                    {
                        name: "Barbell Bicep Curl",
                        value: "BBCurl"
                    },
                    {
                        name: "Preacher Curl",
                        value: "PCurl"
                    },
                    {
                        name: "Bicep Curl Machine",
                        value: "MachineCurl"
                    }
                ]
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