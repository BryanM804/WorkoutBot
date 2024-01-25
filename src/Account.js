const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const WorkoutDay = require(".\\WorkoutDay.js");

class Account{
    constructor(name, id, bodyweight, level, xp, creationDate, skipTotal, skipStreak, restDays, squat, bench, deadlift, history){
        this.name = name;
        this.id = id;
        this.bodyweight = bodyweight || 0;
        this.level = level || 1;
        this.xp = xp || 0;
        this.creationDate = creationDate || new Date().toDateString();
        this.skipTotal = skipTotal || 0;
        this.skipStreak = skipStreak || 0;
        this.restDays = restDays || [];
        this.squat = squat || 0;
        this.bench = bench || 0;
        this.deadlift = deadlift || 0;
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
    getBodyweight(){
        return this.bodyweight;
    }
    getLevel(){
        return this.level;
    }
    getXp(){
        return this.xp;
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
    getSquat(){
        return this.squat;
    }
    getBench(){
        return this.bench;
    }
    getDeadlift(){
        return this.deadlift;
    }
    getTotal(){
        return this.squat + this.bench + this.deadlift;
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

    getHistoryEmbeds(days, startDate){
        if(this.history.length < 1){
            return new EmbedBuilder().setTitle("No history.");
        }

        let startDay = new Date(Date.parse(startDate)).toDateString();
        let startIndex = this.history.length;
        for(let i = 0; i < this.history.length; i++){
            if(this.history[i].getDate() === startDay){
                startIndex = i + 1;
            }
        }

        let historyEmbeds = [];
        let printDays = days;
        if(days > 7){
            printDays = 7;
        }
        if(this.history.length < days){
            printDays = this.history.length;
        }

        for(let i = printDays; i >= 1; i--){
            for(let j = 0; j < this.history[startIndex - i].getEmbeds().length; j++){
                historyEmbeds.push(this.history[startIndex - i].getEmbeds()[j]);
            }
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
            .addFields({ name: `Level ${this.level}`, value: `XP: ${this.xp}/${this.level * 1500}` });
            if(this.bodyweight > 0){
                profileEmbed.addFields({ name: `Body weight:`, value: `${this.bodyweight}lbs` });
            }
            profileEmbed.addFields({ name: `Days Skipped:`, value: ` ${this.skipTotal} days`, inline: true })
            .addFields({ name: `Current Skip Streak:`, value: `${this.skipStreak} days`, inline: true })
            .addFields({ name: "Rest Days:", value: this.getRestDayString(), inline: true });
            if(this.squat > 0){
                profileEmbed.addFields({ name: `Squat:`, value: `${this.squat}lbs`, inline: true });
            }
            if(this.bench > 0){
                profileEmbed.addFields({ name: `Bench:`, value: `${this.bench}lbs`, inline: true });
            }
            if(this.deadlift > 0){
                profileEmbed.addFields({ name: `Deadlift:`, value: `${this.deadlift}lbs`, inline: true });
            }
        return profileEmbed;
    }

    writeInfo(){
        fs.writeFile(this.file, JSON.stringify(this), (err) => {if(err) console.error(err)});
    }

    logSet(movement, weight, reps){
        let today = new Date().toDateString();
        if(this.history.length >= 1 && this.history[this.history.length - 1].getDate() === today){
            this.history[this.history.length - 1].addSet(movement, weight, reps, (weight * reps));
        }else{
            this.history.push(new WorkoutDay(new Date().toDateString()));
            console.log("created new day");
            this.logSet(movement, weight, reps);
            return;
        }

        //Dumbbell exercises count for double the weight internally
        if(movement.indexOf("Dumbbell") >= 0 || movement.startsWith("Hammer")){
            this.xp += 100 + (2 * weight * reps);
            this.history[this.history.length - 1].getSets()[this.history[this.history.length - 1].getSets().length - 1].setSetTotal((2 * weight * reps));
        }else if(movement.indexOf("Assisted") >= 0){
            //If an exercise is assisted and the user has bodyweight registered this adjusts xp and total accordingly
            if(this.bodyweight > 0){
                this.xp += 100 + ((this.bodyweight - weight) * reps);
                this.history[this.history.length - 1].getSets()[this.history[this.history.length - 1].getSets().length - 1].setSetTotal((this.bodyweight - weight) * reps);
            }else{
                this.xp += 100;
                this.history[this.history.length - 1].getSets()[this.history[this.history.length - 1].getSets().length - 1].setSetTotal(0);
            }
        }else if(movement == "Pull Up" || movement == "Chin Up" || movement == "Dip"){
            //If an exercise is a bodyweight exercise this adjusts xp and total accordingly
            if(this.bodyweight > 0){
                this.xp += 100 + ((this.bodyweight + weight) * reps);
                this.history[this.history.length - 1].getSets()[this.history[this.history.length - 1].getSets().length - 1].setSetTotal((this.bodyweight + weight) * reps);
            }else{
                this.xp += 100;
            }
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

    setBodyweight(newBodyweight){
        this.bodyweight = newBodyweight;
        this.writeInfo();
    }
    setRestDays(newRestDays){
        this.restDays = newRestDays;
        this.writeInfo();
    }
    setSquat(newSquat){
        this.squat = newSquat;
        this.writeInfo();
    }
    setBench(newBench){
        this.bench = newBench;
        this.writeInfo();
    }
    setDeadlift(newDeadlift){
        this.deadlift = newDeadlift;
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