const Set = require(".\\Set.js");
class WorkoutDay{
    constructor(date){
        this.date = date;
        this.sets = [];
        this.total = 0;
    }

    getTotal(){
        this.total = 0;
        for(let i = 0; i < this.sets.length; i++){
            this.total += sets[i].total;
        }
        return this.total;
    }
}

module.exports = WorkoutDay