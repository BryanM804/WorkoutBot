class Set{
    constructor(movement, weight, reps, setTotal){
        this.movement = movement;
        this.weight = weight;
        this.reps = reps;
        this.setTotal = setTotal;
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