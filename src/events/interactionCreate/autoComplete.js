const { exerciseList } = require("../../index.js");

module.exports = (client, interaction) => {
    if(interaction.isAutocomplete() && (interaction.commandName === "log" || interaction.commandName === "stats" || interaction.commandName === "fixaccount" || interaction.commandName === "graph")){
        const focused = interaction.options.getFocused();
        const choices = exerciseList;
        const filtered = choices.filter(choice => choice.toLowerCase().indexOf(focused.toLowerCase()) >= 0);
        interaction.respond(
            filtered.slice(0,24).map(choice => ({name: choice, value: choice}))
        );
    }
}