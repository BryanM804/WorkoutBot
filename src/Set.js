class Set{
    constructor(movement, weight, reps){
        this.movement = movement;
        this.weight = weight;
        this.reps = reps;
        //Dumbbell exercises count for double the weight internally
        if(movement.startsWith("Dumbbell")){
            this.setTotal = 2 * weight * reps;
        }else{
            this.setTotal = weight * reps;
        }
    }

    toString(){
        return (`${this.movement}: ${this.weight}lbs ${this.reps} reps`)
    }
}

module.exports = Set