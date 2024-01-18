class Set{
    constructor(movement, weight, reps){
        this.movement = movement;
        this.weight = weight;
        this.reps = reps;
        this.setTotal = weight * reps;
    }

    toString(){
        return (`${this.movement}: ${this.weight}lbs ${this.reps} reps`)
    }
}

module.exports = Set