const Set = require(".\\Set.js");
const { EmbedBuilder } = require("discord.js");
class WorkoutDay{
    constructor(date, sets){
        this.date = date;
        //If this is an existing day it converts the stored sets into Set objects
        if(sets != null && sets.length > 0){
            this.sets = [];
            for(let i = 0; i < sets.length; i++){
                this.sets.push(new Set(sets[i].movement, sets[i].weight, sets[i].reps))
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
            this.dayTotal += this.sets[i].setTotal;
        }
        return this.dayTotal;
    }

    addSet(movement, weight, reps){
        this.sets.push(new Set(movement, weight, reps));
        this.getTotal();
    }

    getEmbed(){
        let dayEmbed = new EmbedBuilder().setTitle(this.date);
        for(let i = 0; i < this.sets.length; i++){
            dayEmbed.addFields({ name: this.sets[i].getMovement(), value: `${this.sets[i].getWeight()}lbs for ${this.sets[i].getReps()} reps`, inline: true});
        }
        dayEmbed.addFields({ name: "Total Weight", value: `${this.dayTotal}lbs`});
        return dayEmbed;
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