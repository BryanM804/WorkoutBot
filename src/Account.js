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
    constructor(name, id, level, xp, creationDate, skipTotal, skipStreak, restDays, history){
        this.name = name;
        this.id = id;
        this.level = level || 1;
        this.xp = xp || 0;
        this.creationDate = creationDate || new Date().toDateString();
        this.skipTotal = skipTotal || 0;
        this.skipStreak = skipStreak || 0;
        this.restDays = restDays || [];
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
    getHistory(){
        return this.history;
    }
    getSkipStreak(){
        return this.skipStreak;
    }
    getRestDays(){
        return this.restDays;
    }
    getHistoryString(days){
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

    logSet(movement, weight, reps){
        var today = new Date().toDateString();
        if(this.history.length >= 1 && this.history[this.history.length - 1].getDate() === today){
            this.history[this.history.length - 1].addSet(movement, weight, reps);
        }else{
            this.history.push(new WorkoutDay(new Date().toDateString()));
            console.log("created new day");
            this.logSet(movement, weight, reps);
        }

        //Dumbbell exercises count for double the weight internally
        if(movement.startsWith("Dumbbell")){
            this.xp += 100 + (2 * weight * reps);
        }else{
            this.xp += 100 + weight * reps;
        }
        while(this.xp >= this.level * 1500){
            this.xp -= (this.level * 1500);
            this.level++;
            console.log(`${this.name} levelled up to ${this.level}`);
        }
        this.skipStreak = 0;
        this.writeInfo();
    }

    skipDay(){
        this.skipTotal++;
        this.skipStreak++;
        this.writeInfo();
    }

    setRestDays(newRestDays){
        this.restDays = newRestDays;
        this.writeInfo();
    }

    toString(){
        let restDaysString = "";
        for(let i = 0; i < this.restDays.length; i++){
            switch(this.restDays[i]){
                case 0:
                    restDaysString += "Sunday";
                    break;
                case 1:
                    restDaysString += "Monday";
                    break;
                case 2:
                    restDaysString += "Tuesday";
                    break;
                case 3:
                    restDaysString += "Wednesday";
                    break;
                case 4:
                    restDaysString += "Thursday";
                    break;
                case 5:
                    restDaysString += "Friday";
                    break;
                case 6:
                    restDaysString += "Saturday";
                    break;
            }
            if(i != this.restDays.length - 1){
                restDaysString += ", ";
            }
        }
        if(restDaysString.length < 1){
            restDaysString = "None"
        }
        return `${this.name}
Created: ${this.creationDate}
Level: ${this.level}
XP: ${this.xp}/${this.level * 1500}
Days Skipped: ${this.skipTotal}
Current Skip Streak: ${this.skipStreak}
Rest Days: ${restDaysString}`;
    }
}

module.exports = Account