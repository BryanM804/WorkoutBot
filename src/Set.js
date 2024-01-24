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

    getMovement(){
        return this.movement;
    }
    getWeight(){
        return this.weight;
    }
    getReps(){
        return this.reps;
    }
    getSetTotal(){
        return this.setTotal;
    }
    setSetTotal(newTotal){
        this.setTotal = newTotal;
    }

    toString(){
        return (`${this.movement}: ${this.weight}lbs ${this.reps} reps`)
    }
}

module.exports = Set