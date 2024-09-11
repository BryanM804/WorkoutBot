const {REST, Routes} = require("discord.js");
require("dotenv").config()

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

(async () => {
    try{
        console.log("Deleting global commands...")

        await(rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: []}));

        console.log("Successfully deleted commands.")
    }catch(error){
        console.log(`ERROR: ${error}`)
    }
})();