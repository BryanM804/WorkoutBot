const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("../../index.js");

module.exports = {
    name: "logzayne",
    description: "Log movements for zaynes account.",
    devOnly: true,
    //deleted: true,
    options: [
        {
            name: "date",
            description: "Date of workout",
            type: ApplicationCommandOptionType.String,
            required: true
        },
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
    ],
    callback: (client, interaction) => {
        let date = new Date(Date.parse(interaction.options.get("date").value)).toDateString();
        let movement = interaction.options.get("movement").value;
        let weight = interaction.options.get("weight")?.value ?? 0;
        let reps = interaction.options.get("reps")?.value ?? 0;
        let sets = interaction.options.get("sets")?.value ?? 1;
        if(weight > 2000 || reps > 100 || sets > 50 || weight < 0 || reps < 0 || sets <= 0){
            interaction.reply("Invalid input.");
        }else{
            console.log(`${interaction.user.username} Logged: ${movement} ${weight} lbs, ${reps} reps, and ${sets} sets for zayne on day ${date}`);
            let tempAccount = findAccount("leeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "426930071459332096");
            let prevLvl = tempAccount.getLevel();
            for(let i = 0; i < sets; i++){
                tempAccount.logSetOnDate(date, movement, weight, reps);
            }
            if(tempAccount.getLevel() > prevLvl){
                interaction.channel.send(`Zayne has leveled up to level ${tempAccount.getLevel()}!`)
            }
            //Reply in chat (will likely change to an embed later)
            if(sets > 1 && weight >= 1){
                interaction.reply(`Logged ${sets} sets of ${movement} ${weight}lbs for ${reps} reps for zayne on day ${date}.`);
            }else if(sets > 1){
                interaction.reply(`Logged ${sets} sets of ${movement} for ${reps} reps for zayne on day ${date}.`);
            }else if(weight >= 1){
                interaction.reply(`Logged ${movement} ${weight}lbs for ${reps} reps for zayne on day ${date}.`);
            }else{
                interaction.reply(`Logged ${movement} for ${reps} reps for zayne on day ${date}.`);
            }
        }
    }
}