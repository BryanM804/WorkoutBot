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
const { EmbedBuilder } = require("discord.js");
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
    getCreationDate(){
        return this.creationDate;
    }
    getHistory(){
        return this.history;
    }
    getSkipTotal(){
        return this.skipTotal;
    }
    getSkipStreak(){
        return this.skipStreak;
    }
    getTotalDays(){
        return this.history.length;
    }
    getRestDays(){
        return this.restDays;
    }
    getStats(movement){
        if(movement == null)
            return;

        let lifeTimeAvg = 0;
        let lifetimeCount = 0;
        let lifeTimeImprovement = 0;
        let firstOccurence = true;
        let lastOccurence;

        for(let i = 0; i < this.history.length; i++){
            for(let j = 0; j < this.history[i].getSets().length; j++){
                if(this.history[i].getSets()[j].getMovement() == movement){
                    if(firstOccurence){
                        lifeTimeImprovement = this.history[i].getSets()[j].getSetTotal();
                        firstOccurence = false;
                    }

                    lifetimeCount++;
                    lifeTimeAvg += this.history[i].getSets()[j].getSetTotal();
                    lastOccurence = this.history[i].getSets()[j];
                }
            }
        }
        lifeTimeImprovement = lastOccurence.getSetTotal() - lifeTimeImprovement;
        lifeTimeAvg = lifeTimeAvg/lifetimeCount;

        return `${movement}:
Average lifetime set total: ${lifeTimeAvg}
Lifetime Set Total Improvement: +${lifeTimeImprovement}
Lifetime Total Sets: ${lifetimeCount}`;
    }
    /*getHistoryString(days){
        if(this.history.length < 1){
            return ("No history.");
        }
        let returnString = "";
        let printDays = days;
        if(this.history.length < days){
            printDays = this.history.length;
        }
        for(let i = 1; i <= printDays; i++){
            returnString += this.history[this.history.length - i].toString();
        }
        return returnString;
    }*/

    getHistoryEmbeds(days){
        if(this.history.length < 1){
            return new EmbedBuilder().setTitle("No history.");
        }

        let historyEmbeds = [];
        let printDays = days;
        if(days > 25){
            printDays = 25;
        }
        if(this.history.length < days){
            printDays = this.history.length;
        }
        for(let i = printDays; i >= 1; i--){
            historyEmbeds.push(this.history[this.history.length - i].getEmbed());
        }
        return historyEmbeds;
    }

    getRestDayString(){
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
        return restDaysString;
    }

    getProfileEmbed(user){
        let profileEmbed = new EmbedBuilder()
            .setTitle(this.name)
            .setThumbnail(user.avatarURL())
            .setDescription(`Created ${this.creationDate}`)
            .addFields({ name: `Level ${this.level}`, value: `XP: ${this.xp}/${this.level * 1500}` })
            .addFields({ name: `Days Skipped: ${this.skipTotal}`, value: " " })
            .addFields({ name: `Current Skip Streak: ${this.skipStreak}`, value: " " })
            .addFields({ name: "Rest Days", value: this.getRestDayString() });

        return profileEmbed;
    }

    writeInfo(){
        fs.writeFile(this.file, JSON.stringify(this), (err) => {if(err) console.error(err)});
    }

    logSet(movement, weight, reps){
        let today = new Date().toDateString();
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
        return `${this.name}
Created: ${this.creationDate}
Level: ${this.level}
XP: ${this.xp}/${this.level * 1500}
Days Skipped: ${this.skipTotal}
Current Skip Streak: ${this.skipStreak}
Rest Days: ${this.getRestDayString()}`;
    }
}

module.exports = Account