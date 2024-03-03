const Set = require(".\\Set.js");
const { EmbedBuilder } = require("discord.js");
class WorkoutDay{

    static getEmbeds(sets, label){
        if (sets.length < 1) return;
        
        let dayEmbeds = [];
        let embedNum = 0;
        let total = 0;
        dayEmbeds[0] = new EmbedBuilder();

        if (label) {
            dayEmbeds[0].setTitle(label)
            .setAuthor({ name: sets[0].date});
        } else {
            dayEmbeds[0].setTitle(sets[0].date);
        }

        for (let i = 0; i < sets.length; i++) {
            if ((i+1) % 26 === 0) {
                embedNum++;
                dayEmbeds.push(new EmbedBuilder().setTitle(`${sets[0].date} Page ${embedNum + 1}`));
            }
            dayEmbeds[embedNum].addFields({ name: sets[i].movement, value: `${sets[i].weight}lbs for ${sets[i].reps} reps`, inline: true});
            total += sets[i].settotal;
        }

        dayEmbeds[embedNum].setFooter({ text: `Total Weight: ${total}lbs | Total Sets: ${sets.length}`});
        return dayEmbeds;
    }
}

module.exports = WorkoutDay