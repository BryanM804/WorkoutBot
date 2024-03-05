const { ActivityType } = require("discord.js");

let botClient;

module.exports = (client) => {
    botClient = client;
    setRandomActivity();
}

function setRandomActivity() {
    let random = Math.floor((Math.random() * 6) + 1)
    
    switch (random) {
        case 1:
            botClient.user.setActivity({
                name: "with heavy circles",
                type: ActivityType.Playing
            });

            console.log("Now playing with heavy circles.");
            break;
        case 2:
            botClient.user.setActivity({
                name: "21 Pump Street",
                type: ActivityType.Watching
            });

            console.log("Now watching 21 Pump Street.");
            break;
        case 3:
            botClient.user.setActivity({
                name: "the posedown",
                type: ActivityType.Watching
            });

            console.log("Now watching the posedown.");
            break;
        case 4:
            botClient.user.setActivity({
                name: "Clash Royale on the recumbent bike",
                type: ActivityType.Playing
            });

            console.log("Now playing Clash Royale on the recumbent bike.");
            break;
        case 5:
            botClient.user.setActivity({
                name: "Back to Me by Kanye West",
                type: ActivityType.Listening
            });

            console.log("Now listening to Back to Me by Kanye West.");
            break;
        case 6:
            botClient.user.setActivity({
                name: "The Bottom 2",
                type: ActivityType.Listening
            });

            console.log("Now listening to The Bottom 2.");
            break;
        default:
            botClient.user.setActivity({
                name: "with heavy circles",
                type: ActivityType.Playing
            });

            console.log("Activity default branch.");
            break;  
    }
    setTimeout(setRandomActivity, 1800000); // Every 30 minutes
}