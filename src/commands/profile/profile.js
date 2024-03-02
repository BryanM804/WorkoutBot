const { ApplicationCommandOptionType } = require("discord.js");
const { findAccount } = require("..\\..\\index.js");

module.exports = {
    name: "profile",
    description: "See your profile information.",
    options: [
        {
            name: "user",
            description: "See another users's profile",
            type: ApplicationCommandOptionType.User
        }
    ],
    callback: (client, interaction) => {
        const otherUser = interaction.options.get("user")?.user ?? null;

        if (otherUser != null) {
            // This command checks if a user has a profile or not since I want the creation date to reflect when that user actually started using the app.
            const otherAccount = findAccount(otherUser.username, otherUser.id, false);

            // profile embed needs user object for the avatar URL
            if (otherAccount != null) {
                otherAccount.getProfileEmbed(otherUser, (profEmbed) => {
                    interaction.reply({ embeds: [profEmbed] });
                    console.log(`${interaction.user.username} fetched the profile of ${otherUser.username}.`);
                })
            } else {
                interaction.reply(`${otherUser.displayName} has no profile.`);
                console.log(`${interaction.user.username} tried to fetch the profile of ${otherUser.username} but they have not yet created one.`)
            }
        } else {
            findAccount(interaction.user.username, interaction.user.id).getProfileEmbed(interaction.user, (profEmbed) => {
                interaction.reply({ embeds: [profEmbed] });
                console.log(`${interaction.user.username} fetched their profile.`);
            });
        }
    }
}