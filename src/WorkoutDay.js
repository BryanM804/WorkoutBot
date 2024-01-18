const Set = require(".\\Set.js");
class WorkoutDay{
    constructor(date, sets, dayTotal){
        this.date = date;
        //If this is an existing day it converts the stored sets into Set objects
        if(sets > 0){
            this.sets = [];
            for(let i = 0; i < sets.length; i++){
                this.sets.push(new Set(sets[i].movement, sets[i].weight, sets[i].reps))
            }
        }else{
            this.sets = [];
        }
        this.dayTotal = dayTotal || 0;
    }

    getDate(){
        return this.date;
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
}

module.exports = WorkoutDay