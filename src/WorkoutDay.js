const Set = require(".\\Set.js");
const { EmbedBuilder } = require("discord.js");
class WorkoutDay{
    constructor(date, sets, label){
        this.date = date;
        //If this is an existing day it converts the stored sets into Set objects
        if(sets != null && sets.length > 0){
            this.sets = [];
            for(let i = 0; i < sets.length; i++){
                this.sets.push(new Set(sets[i].movement, sets[i].weight, sets[i].reps, sets[i].setTotal))
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

    getEmbeds(){
        let dayEmbeds = [];
        let embedNum = 0;
        dayEmbeds[0] = new EmbedBuilder();

        if (this.label != "") {
            dayEmbeds[0].setTitle(this.label)
            .setAuthor({ name: this.date});
        } else {
            dayEmbeds[0].setTitle(this.date);
        }

        this.getTotal();

        for (let i = 0; i < this.sets.length; i++) {
            if ((i+1) % 26 === 0) {
                embedNum++;
                dayEmbeds.push(new EmbedBuilder().setTitle(`${this.date} Page ${embedNum + 1}`));
            }
            dayEmbeds[embedNum].addFields({ name: this.sets[i].getMovement(), value: `${this.sets[i].getWeight()}lbs for ${this.sets[i].getReps()} reps`, inline: true});
        }

        dayEmbeds[embedNum].setFooter({ text: `Total Weight: ${this.dayTotal}lbs | Total Sets: ${this.sets.length}`});
        return dayEmbeds;
    }
}

module.exports = WorkoutDay