const getLocalCommands = require("../../utils/getLocalCommands");
const { testServer, devs } = require("../../../config.json")

module.exports = async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
        const localCommands = getLocalCommands();

        try {
            const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);
    
            if (!commandObject) return;
    
            if (commandObject.devOnly) {
                if (!devs.includes(interaction.member.id)) {
                    interaction.reply({ content: "This can only be run by developers.", ephemeral: true });
                    return;
                }
            }
    
            if (commandObject.permissionsRequired?.length) {
                for (const permission of commandObject.permissionsRequired) {
                    if (!interaction.member.has(permission)) {
                        interaction.reply({ content: "Not enough permission.", ephemeral: true });
                        break;
                    }
                }
            }
    
            await commandObject.callback(client, interaction);
    
        } catch (error) {
            console.log(`Error running ${interaction.commandName}: ${error}`);
        }
    // These stop discord from saying the interaction failed when interacting with the action row
    } else if(interaction.isButton()) {
        interaction.deferUpdate();
    } else if(interaction.isStringSelectMenu()) {
        interaction.deferUpdate();
    }
}