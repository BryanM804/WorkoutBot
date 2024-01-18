class Set{
    constructor(movement, weight, reps){
        this.movement = movement;
        this.weight = weight;
        this.reps = reps;
        this.setTotal = weight * reps;
    }
}

module.exports = Set