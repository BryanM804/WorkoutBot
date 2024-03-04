const { EmbedBuilder } = require("discord.js");

module.exports.HelpEmbed = new EmbedBuilder()
    .setTitle("Lifter's Logistics Help")
    .setDescription("Here is how to get started with using the bot.")
    .addFields({ name: "/log [movement] [weight] [reps] [sets] [date]", value: "Use this command and pick a [movement] from the list along with the [weight] you used and the [reps] you did. You can also log multiple [sets] at a time if they were exactly the same.\n- If an exercise uses dumbbells, log the weight of **one dumbbell**.\n- If an exercise is a body weight exercise, log the **additional** weight if any.\n- Split exercises such as Bulgarian Split Squats and single arm exercises assume you are logging one arm/leg at a time.\n- If you need to log for a previous day use [date] otherwise sets are automatically logged on the current day." })
    .addFields({ name: "/undo [sets]", value: "Use this command to undo the last logged set, or [sets], if you made a mistake." })
    .addFields({ name: "/repeat [sets] [weight] [reps]", value: "Use this command to repeat the last logged movement [sets] times, leaving [weight] and/or [reps] blank uses the previous set's numbers." })
    .addFields({ name: "/profile [user]", value: "Use this command to view information about your profile such as your level, current xp, body weight, days skipped, skip streak, and programmed rest days.\n- Adding a [user] allows you to view someone elses profile." })
    .addFields({ name: "/history [days] [date]", value: "Use this command to view your history of logged sets.\n- Shows last day by default unless you specify a number of [days] up to a max of 7.\n- Entering a [date] will give you the history starting from that date." })
    .addFields({ name: "/stats [movement]", value: "Use this command to see statistics about the specified [movement] you have logged." })
    .addFields({ name: "/graph [movement]", value: "Use this command to generate a graph of your average set total for a [movement] for each logged day in your history. (WIP)" })
    .addFields({ name: "/restday [day]", value: "Use this command to save/unsave a programmed rest day.\n- Rest days will not count as days skipped or add to your skip streak." })
    .addFields({ name: "/bodyweight [weight]", value: "Use this command to register your body weight.\n- **NOTE:** If you do not register a body weight, assisted exercises and bodyweight exercises will not give you xp." })
    .addFields({ name: "/squat /bench /deadlift", value: "Use these commands to register your squat, bench, and deadlift one rep max." })
    .addFields({ name: "/label [label]", value: "Use this command to label the current day."})
    .addFields({ name: "/leaderboard [stat]", value: "Use this command to display a global leaderboard of all users sorted by specified [stat]." })
    .setFooter({ text: "Created by Bryan." });