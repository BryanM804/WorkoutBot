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
                this.history.push(new WorkoutDay(history[i].date, history[i].sets, history[i].label));
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

        let lifetimeAvgWeight = 0;
        let lifetimeAvgReps = 0;
        let thirtyDayAvgWeight = 0;
        let thirtyDayAvgReps = 0;
        let mostWeight = 0;
        let mostWeightDate = "";
        let mostReps = 0;
        let mostRepsDate = "";
        let bestTotal = 0;
        let bestSetDate = "";
        let bestSetWeight = 0;
        let bestSetReps = 0;
        let lifetimeCount = 0;
        let thirtyDayCount = 0;
        let lifetimeImprovement = 0;
        let firstOccurence = true;
        let lastOccurence;

        for(let i = this.history.length - 1; i >= 0; i--){
            for(let j = 0; j < this.history[i].getSets().length; j++){
                let currentSet = this.history[i].getSets()[j];
                if(currentSet.getMovement() == movement){
                    //Need a better "Improvement" calculation than difference of first and last set
                    //if(firstOccurence){
                    //    lifetimeImprovement = currentSet.getSetTotal();
                    //    firstOccurence = false;
                    //}
                    if(i > this.history.length - 30){
                        thirtyDayAvgWeight += currentSet.getWeight();
                        thirtyDayAvgReps += currentSet.getReps();
                        thirtyDayCount++;
                    }
                    if(currentSet.getWeight() > mostWeight){
                        mostWeight = currentSet.getWeight();
                        mostWeightDate = this.history[i].getDate();
                    }
                    if(currentSet.getReps() > mostReps){
                        mostReps = currentSet.getReps();
                        mostRepsDate = this.history[i].getDate();
                    }
                    if(currentSet.getSetTotal() > bestTotal){
                        bestTotal = currentSet.getSetTotal();
                        bestSetWeight = currentSet.getWeight();
                        bestSetReps = currentSet.getReps();
                        bestSetDate = this.history[i].getDate();
                    }
                        

                    lifetimeCount++;
                    lifetimeAvgWeight += currentSet.getWeight();
                    lifetimeAvgReps += currentSet.getReps();

                    //lastOccurence = currentSet.getSetTotal();
                }
            }
        }
        //lifetimeImprovement = lastOccurence - lifetimeImprovement;
        lifetimeAvgWeight /= lifetimeCount;
        lifetimeAvgReps /= lifetimeCount;
        thirtyDayAvgWeight /= thirtyDayCount;
        thirtyDayAvgReps /= thirtyDayCount;
        
        if(lifetimeCount == 0){
            return new EmbedBuilder().setTitle(`No data logged for ${movement}`);
        }else{
            //Averages are rounded so they only display one decimal place
            let statsEmbed = new EmbedBuilder()
            .setTitle(`${this.name}'s ${movement}`)
            .addFields({ name: "\0", value: "**__30 Day__**" })
            .addFields({ name: "Average Weight", value: `${Math.round(thirtyDayAvgWeight * 10) / 10}lbs`, inline: true })
            .addFields({ name: "Average Reps", value: `${Math.round(thirtyDayAvgReps * 10) / 10}`, inline: true })
            .addFields({ name: "\0", value: "**__Lifetime__**" })
            .addFields({ name: "Average Weight", value: `${Math.round(lifetimeAvgWeight * 10) / 10}lbs`, inline: true })
            .addFields({ name: "Average Reps", value: `${Math.round(lifetimeAvgReps * 10) / 10}`, inline: true })
            .addFields({ name: "\0", value: "**__Records__**" })
            .addFields({ name: "Most Weight", value: `${mostWeight}lbs on ${mostWeightDate}`, inline: true })
            .addFields({ name: "Most Reps", value: `${mostReps} reps on ${mostRepsDate}`, inline: true })
            .addFields({ name: "Best Set", value: `${bestSetWeight}lbs x ${bestSetReps} reps = ${bestTotal} on ${bestSetDate}`, inline: true })
            .setFooter({ text: `Total Sets: ${lifetimeCount}\nSets recorded in the last 30 days: ${thirtyDayCount}`})

            return statsEmbed;
        }
    }

    //Returns the embed(s) for all of the sets for a given (days) starting from (startDate)
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
        //Needs user for the avatarURL
        let profileEmbed = new EmbedBuilder()
            .setTitle(this.name)
            .setThumbnail(user.avatarURL())
            .setFooter({ text: `Created ${this.creationDate}` })
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

    //In the future I may update the way files are stored since as is, I forsee them getting quite large
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
            console.log(`${this.name} leveled up to ${this.level}`);
        }
        this.skipStreak = 0;
        this.writeInfo();
    }

    repeatSet(){
        let today = new Date().toDateString();
        if(this.history.length >= 1 && this.history[this.history.length - 1].getDate() === today && this.history[this.history.length - 1].getSets().length >= 1){
            const lastSet = this.history[this.history.length - 1].getSets()[this.history[this.history.length - 1].getSets().length - 1];
            this.logSet(lastSet.getMovement(), lastSet.getWeight(), lastSet.getReps());
            return lastSet;
        }else{
            return false;
        }
    }

    skipDay(){
        this.skipTotal++;
        this.skipStreak++;
        this.writeInfo();
    }

    undoSet(sets){
        let today = new Date().toDateString();
        if(!(this.history.length >= 1 && this.history[this.history.length - 1].getDate() === today)){
            return false;
        }

        let removeSets = sets || 1;
        if(removeSets <= 0)
            removeSets = 1;

        for(let i = 0; i < removeSets; i++){
           let result = this.history[this.history.length - 1].removeSet();
           if(result < 0){
                this.history.pop();
                this.writeInfo();
                return false;
           }else{
                this.xp -= result + 100;
                while(this.xp < 0){
                    this.level--;
                    this.xp += this.level * 1500;
                }
           }
        }
        if(this.history[this.history.length - 1].getSets().length == 0){
            this.history.pop();
        }
        this.writeInfo();
        return true;
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
    setDayLabel(newLabel){
        let today = new Date().toDateString();
        if(this.history.length >= 1 && this.history[this.history.length - 1].getDate() === today){
            this.history[this.history.length - 1].setLabel(newLabel);
            this.writeInfo();
            return true;
        }else{
            return false;
        }
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