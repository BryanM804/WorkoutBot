const { EmbedBuilder } = require("discord.js");

module.exports.HelpEmbed = new EmbedBuilder()
    .setTitle("Workout Bot Help")
    .setDescription("Here is how to get started with using the bot.")
    .addFields({ name: "/log", value: "Use this command and pick a [movement] from the list along with the [weight] you used and the [reps] you did. You can also log multiple [sets] at a time if they were exactly the same."})
    .addFields({ name: "/profile", value: "Use this command to view information about your profile such as your level, current xp, days skipped, skip streak, and programmed rest days. Adding a [user] allows you to view someone elses profile."})
    .addFields({ name: "/history", value: "Use this command to view your history of logged sets. Shows previous 3 days by default unless you specify a number of [days]."})
    .addFields({ name: "/restday", value: "Use this command to save/unsave a programmed rest day. Rest days will not count as days skipped or add to your skip streak."});