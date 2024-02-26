const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "repeat",
    description: "Log a duplicate of the last set you logged.",
    options: [
        {
            name: "sets",
            description: "Number of times to repeat.",
            type: ApplicationCommandOptionType.Integer
        }
    ],
    callback: (client, interaction) => {
        let userAccount = findAccount(interaction.user.username, interaction.user.id);
        let lastSet;
        let repeats = interaction.options.get("sets")?.value ?? 1;
        let prevLevel = userAccount.getLevel();
        for(let i = 0; i < repeats; i++){
            lastSet = userAccount.repeatSet();
            console.log(`${interaction.user.username} repeated last set.`);
        }

        if(userAccount.getLevel() > prevLevel){
            interaction.channel.send(`${interaction.user} has leveled up to level ${userAccount.getLevel()}!`);
        }

        if(lastSet){
            if(repeats > 1 && lastSet.getWeight() >= 1)
                interaction.reply(`Logged ${repeats} sets of ${lastSet.getMovement()} ${lastSet.getWeight()}lbs for ${lastSet.getReps()} reps.`);
            else if(repeats > 1)
                interaction.reply(`Logged ${repeats} sets of ${lastSet.getMovement()} for ${lastSet.getReps()} reps.`);
            else if(lastSet.getWeight() >= 1)
                interaction.reply(`Logged ${lastSet.getMovement()} ${lastSet.getWeight()}lbs for ${lastSet.getReps()} reps.`);
            else
                interaction.reply(`Logged ${lastSet.getMovement()} for ${lastSet.getReps()} reps.`);
        }else{
            interaction.reply("No previous set to repeat for today.");
        }
    }
}