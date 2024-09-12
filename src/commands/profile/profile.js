const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { findAccount } = require("../../index.js");
const createConnection = require("../../createConnection.js");
const getRestDayString = require("../../utils/getRestDayString.js");

const con = createConnection();

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

        let profileUser;
        let replying = false;

        if (otherUser != null) {
            // This command checks if a user has a profile or not since I want the creation date to reflect when that user actually started using the app.
            const otherAccount = findAccount(otherUser.username, otherUser.id, false);

            // profile embed needs user object for the avatar URL
            if (otherAccount != null) {
                profileUser = otherUser;
                replying = true;
            } else {
                interaction.reply(`${otherUser.displayName} has no profile.`);
                console.log(`${interaction.user.username} tried to fetch the profile of ${otherUser.username} but they have not yet created one.`)
            }
        } else {
            profileUser = interaction.user;
            replying = true;
        }

        if (replying) {
            const user = findAccount(profileUser.username, profileUser.id);

            // Needs user for the avatarURL
            user.getStatsFromDB(false, (result) => {
    
                let profileEmbed = new EmbedBuilder()
                .setTitle(user.name)
                .setThumbnail(profileUser.avatarURL())
                .setFooter({ text: `Created ${user.creationDate}` })
                .addFields({ name: `Level ${user.level}`, value: `XP: ${user.xp}/${user.level * 1500}` });
                if (user.bodyweight > 0) {
                    profileEmbed.addFields({ name: `Body weight:`, value: `${user.bodyweight}lbs` });
                }
                profileEmbed.addFields({ name: `Days Skipped:`, value: ` ${user.skipTotal} days`, inline: true })
                .addFields({ name: `Current Skip Streak:`, value: `${user.skipStreak} days`, inline: true })
                .addFields({ name: "Rest Days:", value: getRestDayString(user), inline: true });
                if (user.squat > 0) {
                    profileEmbed.addFields({ name: `Squat:`, value: `${user.squat}lbs`, inline: true });
                }
                if (user.bench > 0) {
                    profileEmbed.addFields({ name: `Bench:`, value: `${user.bench}lbs`, inline: true });
                }
                if (user.deadlift > 0) {
                    profileEmbed.addFields({ name: `Deadlift:`, value: `${user.deadlift}lbs`, inline: true });
                }
    
                interaction.reply({ embeds: [profileEmbed] });
                console.log(`${profileUser.username} profile fetched.`);
            });
        }
    }
}