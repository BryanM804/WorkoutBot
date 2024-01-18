const Set = require(".\\Set.js");
class WorkoutDay{
    constructor(date){
        this.date = date;
        this.sets = [];
        this.dayTotal = 0;
    }

    getTotal(){
        this.dayTotal = 0;
        for(let i = 0; i < this.sets.length; i++){
            this.dayTotal += sets[i].setTotal;
        }
        return this.dayTotal;
    }

    addSet(movement, weight, reps){
        this.sets.push(new Set(movement, weight, reps));
        this.getTotal();
    }
}

module.exports = WorkoutDay