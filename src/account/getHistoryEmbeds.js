const { EmbedBuilder } = require("discord.js");
const { findAccount } = require("../index.js")
const WorkoutDay = require("../WorkoutDay.js");
const pool = require("../pool.js");

module.exports = async (interaction, date) => {
    const userAccount = findAccount(interaction.user.username, interaction.user.id);
    let historyEmbeds = [];

    const results = await pool.query(`SELECT * FROM lifts WHERE userID = '${userAccount.id}' AND date = '${date}';`)
    const labels = await pool.query(`SELECT * FROM labels WHERE userID = '${userAccount.id}' AND date = '${date}' ORDER BY labelid DESC;`)
    let embeds = WorkoutDay.getEmbeds(results, labels.length > 0 ? labels[0].label : null);
    
    if (embeds) {
        for (let x = 0; x < embeds.length; x++) {
            historyEmbeds.push(embeds[x]);
        }
    } else {
        historyEmbeds.push(new EmbedBuilder().setTitle("No history.").setAuthor({ name: date }));
    }
    
    console.log(`${interaction.user.username} fetched history from ${date}.`);
        
    return historyEmbeds;
}