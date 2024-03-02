const Set = require(".\\Set.js");
const { EmbedBuilder } = require("discord.js");
class WorkoutDay{
    constructor(date, sets, label){
        this.date = date;
        //If this is an existing day it converts the stored sets into Set objects
        if(sets != null && sets.length > 0){
            this.sets = [];
            for(let i = 0; i < sets.length; i++){
                this.sets.push(new Set(sets[i].movement, sets[i].weight, sets[i].reps, sets[i].setTotal, sets[i].setNumber))
            }
        }else{
            this.sets = [];
        }
        this.dayTotal = 0;
        this.label = label || "";
        this.getTotal()
    }

    getDate(){
        return this.date;
    }
    getSets(){
        return this.sets;
    }
    getLabel(){
        return this.label;
    }
    getTotal(){
        if (this.sets.length < 1) return;

        this.dayTotal = 0;

        for (let i = 0; i < this.sets.length; i++) {
            this.dayTotal += this.sets[i].getSetTotal();
        }

        return this.dayTotal;
    }

    setLabel(newLabel){
        this.label = newLabel;
    }

    addSet(movement, weight, reps, setTotal){
        this.sets.push(new Set(movement, weight, reps, setTotal));
        this.getTotal();
    }

    removeSet(){
        if (this.sets.length > 0) {
            let total = this.sets[this.sets.length - 1].getSetTotal();
            this.sets.pop();
            return total;
        } else {
            return -1;
        }
    }

    getAverageForExercise(exercise) {
        let average, count;
        for (const set of sets) {
            if (set.getMovement() == exercise) {
                average += set.getTotal();
                count++;
            }
        }

        return average / count;
    }

    static getEmbeds(sets){
        if (sets.length < 1) return;
        
        let dayEmbeds = [];
        let embedNum = 0;
        dayEmbeds[0] = new EmbedBuilder();

        //if (this.label != "") {
        //    dayEmbeds[0].setTitle(this.label)
        //    .setAuthor({ name: this.date});
        //} else {
            dayEmbeds[0].setTitle(sets[0].date);
        //}

        //this.getTotal();

        for (let i = 0; i < sets.length; i++) {
            if ((i+1) % 26 === 0) {
                embedNum++;
                dayEmbeds.push(new EmbedBuilder().setTitle(`${sets[0].date} Page ${embedNum + 1}`));
            }
            dayEmbeds[embedNum].addFields({ name: sets[i].movement, value: `${sets[i].weight}lbs for ${sets[i].reps} reps`, inline: true});
        }

        dayEmbeds[embedNum].setFooter({ text: `Total Weight: ${0}lbs | Total Sets: ${sets.length}`});
        return dayEmbeds;
    }
}

module.exports = WorkoutDay