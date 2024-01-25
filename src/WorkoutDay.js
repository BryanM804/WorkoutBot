const Set = require(".\\Set.js");
const { EmbedBuilder } = require("discord.js");
class WorkoutDay{
    constructor(date, sets){
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
        this.getTotal()
    }

    getDate(){
        return this.date;
    }
    getSets(){
        return this.sets;
    }
    getTotal(){
        if(this.sets.length < 1)
            return;
        this.dayTotal = 0;
        for(let i = 0; i < this.sets.length; i++){
            this.dayTotal += this.sets[i].getSetTotal();
        }
        return this.dayTotal;
    }

    addSet(movement, weight, reps, setTotal){
        this.sets.push(new Set(movement, weight, reps, setTotal));
        this.getTotal();
    }

    getEmbeds(){
        let dayEmbeds = [];
        let embedNum = 0;
        dayEmbeds[0] = new EmbedBuilder().setTitle(this.date);
        this.getTotal();
        for(let i = 0; i < this.sets.length; i++){
            if((i+1) % 26 === 0){
                embedNum++;
                dayEmbeds.push(new EmbedBuilder().setTitle(`${this.date} Page ${embedNum + 1}`));
            }
            dayEmbeds[embedNum].addFields({ name: this.sets[i].getMovement(), value: `${this.sets[i].getWeight()}lbs for ${this.sets[i].getReps()} reps`, inline: true});
        }
        dayEmbeds[embedNum].addFields({ name: "Total Weight", value: `${this.dayTotal}lbs`});
        return dayEmbeds;
    }

    toString(){
        var setsString = "";
        for(let i = 0; i < this.sets.length; i++){
            setsString += this.sets[i].toString()+"\n";
        }
        return (`${this.date}\n${setsString}Total Weight: ${this.dayTotal}`);
    }
}

module.exports = WorkoutDay