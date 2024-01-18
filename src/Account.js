//File Format:
//[name]
//[id]
//[level]
//[xp]
//[date created]
//[skip total]
//[skip streak]
//History: (each consecutive day gets added to the bottom)
//[day]
//[movement]
//[weight] * [reps] = [set total]
//[daily total]
const fs = require("fs");
const WorkoutDay = require(".\\WorkoutDay.js");

class Account{
    constructor(name, id){
        this.name = name;
        this.id = id;
        this.level = 1;
        this.xp = 0;
        this.creationDate = new Date().toDateString();
        this.skipTotal = 0;
        this.skipStreak = 0;
        this.history = []; //To be filled with WorkoutDay objects
        this.file = `accounts\\${name}.json`;
        this.writeInfo();
    }

    getName(){
        return this.name;
    }
    getId(){
        return this.id;
    }

    writeInfo(){
        fs.writeFile(this.file, JSON.stringify(this), (err) => {if(err) console.error(err)});
    }

    toString(){
        return `${this.name}: ${this.id}`;
    }
}

module.exports = Account