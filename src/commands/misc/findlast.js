const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { findAccount } = require("../../index.js");
const pool = require("../../pool.js");

module.exports = {
    name: "findlast",
    description: "Find the last time you logged a certain movement.",
    options: [
        {
            name: "movement",
            description: "Type of movement.",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        }
    ],
    callback: (client, interaction) => {
        // const account = findAccount(interaction.user.username, interaction.user.id);
        // find account is kind of useless now
        pool.getConnection((conErr, con) => {
            if (conErr) console.log(`Connection error: ${conErr}`);
            con.query(`SELECT movement, weight, reps, date
                        FROM lifts
                        WHERE userID = '${interaction.user.id}'
                        AND movement = '${interaction.options.get("movement").value}'
                        AND dateval = (SELECT MAX(dateval) 
                                        FROM lifts 
                                        WHERE userID = '${interaction.user.id}'
                                        AND movement = '${interaction.options.get("movement").value}');`, (err, res) => {
                    if (err) console.log(`Query Error finding last occurence: ${err}`);
                    
                    if (res.length == 0) {
                        interaction.reply(`No occurences of ${interaction.options.get("movement").value} found.`);
                    } else {
                        con.query(`SELECT label 
                                    FROM labels l
                                    WHERE userID = '${interaction.user.id}'
                                    AND l.date = '${res[0].date}'
                                    ORDER BY labelid DESC;`, (err2, label) => {
                            if (err2) console.log(`Error querying labels: ${err2}`);
                                
                            let embed = new EmbedBuilder();
                            
                            if (label.length == 0) {
                                embed.setTitle(res[0].date);
                            } else {
                                embed.setTitle(label[0].label)
                                .setAuthor({name: res[0].date});
                            }

                            for (const s of res) {
                                embed.addFields({name: s.movement, value: `${s.weight}lbs for ${s.reps} reps`, inline: true})
                            }
                            
                            con.release();
                            interaction.reply({message: `Last occurence of ${interaction.options.get("movement").value}`, embeds: [embed]});
                        })
                    }
                })
        })
    }
}