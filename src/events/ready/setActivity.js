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
            break;
        case 2:
            botClient.user.setActivity({
                name: "21 Pump Street",
                type: ActivityType.Watching
            });
            break;
        case 3:
            botClient.user.setActivity({
                name: "the posedown",
                type: ActivityType.Watching
            });
            break;
        case 4:
            botClient.user.setActivity({
                name: "Clash Royale on the recumbent bike",
                type: ActivityType.Playing
            });
            break;
        case 5:
            botClient.user.setActivity({
                name: "Back to Me by Kanye West",
                type: ActivityType.Listening
            });
            break;
        case 6:
            botClient.user.setActivity({
                name: "The Bottom 2",
                type: ActivityType.Listening
            });
            break;
        default:
            botClient.user.setActivity({
                name: "with heavy circles",
                type: ActivityType.Playing
            });
            break;  
    }
    setTimeout(setRandomActivity, 1800000); // Every 30 minutes
}