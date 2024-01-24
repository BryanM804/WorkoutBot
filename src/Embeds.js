const { EmbedBuilder } = require("discord.js");

module.exports.HelpEmbed = new EmbedBuilder()
    .setTitle("Workout Bot Help")
    .setDescription("Here is how to get started with using the bot.")
    .addFields({ name: "/log [movement] [weight] [reps] [sets]", value: "Use this command and pick a [movement] from the list along with the [weight] you used and the [reps] you did. You can also log multiple [sets] at a time if they were exactly the same.\n- If an exercise uses dumbbells, log the weight of **one dumbbell**.\n- If an exercise is a body weight exercise, log the **additional** weight if any."})
    .addFields({ name: "/profile [user]", value: "Use this command to view information about your profile such as your level, current xp, body weight, days skipped, skip streak, and programmed rest days. Adding a [user] allows you to view someone elses profile."})
    .addFields({ name: "/history [days]", value: "Use this command to view your history of logged sets.\n- Shows previous 3 days by default unless you specify a number of [days] up to a max of 25."})
    .addFields({ name: "/restday [day]", value: "Use this command to save/unsave a programmed rest day.\n- Rest days will not count as days skipped or add to your skip streak."})
    .addFields({ name: "/bodyweight [weight]", value: "Use this command to register your body weight.\n- **NOTE:** If you do not register a body weight, assisted exercises and bodyweight exercises will not give you xp."})
    .addFields({ name: "/leaderboard [stat]", value: "Use this command to display a global leaderboard of all users sorted by specified [stat]."})
    .setFooter({ text: "Created by Bryan." });