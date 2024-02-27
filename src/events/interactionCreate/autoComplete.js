const { ExerciseList } = require("..\\..\\utils\\Exercises.js");
module.exports = (client, interaction) => {
    if(interaction.isAutocomplete() && (interaction.commandName === "log" || interaction.commandName === "stats" || interaction.commandName === "fixaccount")){
        const focused = interaction.options.getFocused();
        const choices = ExerciseList;
        const filtered = choices.filter(choice => choice.toLowerCase().indexOf(focused.toLowerCase()) >= 0);
        interaction.respond(
            filtered.slice(0,24).map(choice => ({name: choice, value: choice}))
        );
    }
}