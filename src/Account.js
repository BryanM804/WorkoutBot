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

//Things to fix:
//If the program crashes the account file gets deleted.
const fs = require("fs");
const WorkoutDay = require(".\\WorkoutDay.js");

class Account{
    constructor(name, id, level, xp, creationDate, skipTotal, skipStreak, history){
        this.name = name;
        this.id = id;
        this.level = level || 1;
        this.xp = xp || 0;
        this.creationDate = creationDate || new Date().toDateString();
        this.skipTotal = skipTotal || 0;
        this.skipStreak = skipStreak || 0;
        //If the user has a history it converts the history it has read into WorkoutDay objects
        if(history != null && history.length > 0){
            this.history = []
            for(let i = 0; i < history.length; i++){
                this.history.push(new WorkoutDay(history[i].date, history[i].sets));
            }
        }else{
            this.history = [];
        }
        this.file = `accounts\\${name}.json`;
        this.writeInfo();
    }

    getName(){
        return this.name;
    }
    getId(){
        return this.id;
    }
    getLevel(){
        return this.level;
    }
    getHistory(days){
        if(this.history.length < 1){
            return ("No history.");
        }
        var returnString = "";
        var printDays = days;
        if(this.history.length < days){
            printDays = this.history.length;
        }
        for(let i = 1; i <= printDays; i++){
            returnString += this.history[this.history.length - i].toString();
        }
        return returnString;
    }

    writeInfo(){
        fs.writeFile(this.file, JSON.stringify(this), (err) => {if(err) console.error(err)});
    }
    //Overriding history and only saving one set for some reason
    logSet(movement, weight, reps){
        var today = new Date().toDateString();
        if(this.history.length >= 1 && this.history[this.history.length - 1].getDate() === today){
            this.history[this.history.length - 1].addSet(movement, weight, reps);
        }else{
            this.history.push(new WorkoutDay(new Date().toDateString()));
            console.log("created new day");
            this.logSet(movement, weight, reps);
        }
        this.xp += 100 + weight * reps;
        while(this.xp >= this.level * 1500){
            this.xp -= (this.level * 1500);
            this.level++;
            console.log(`${this.name} levelled up to ${this.level}`);
        }
        this.writeInfo();
    }

    toString(){
        return `${this.name}\nCreated: ${this.creationDate}\nLevel: ${this.level}\nXP: ${this.xp}/${this.level * 1500}\nDays Skipped: ${this.skipTotal}`;
    }
}

module.exports = Account