const fs = require("fs");

class Account{
    constructor(guildID, name, id){
        this.name = name;
        this.id = id;
        this.file = `servers\\${guildID}\\${name}.txt`;
        this.readInfo(this.file);
    }

    getName(){
        return this.name;
    }
    getId(){
        return this.id;
    }

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

    readInfo(input){
        const date = new Date();
        fs.access(input, (error) => {
            if(error){
                console.error(error);
                fs.writeFile(input, `${this.name}\n${this.id}\n1\n0\n${date.toDateString()}\n0\n0\n`, (err) => {console.log(`ERROR: ${err}`)})
            }
        })
    }
}

module.exports = Account