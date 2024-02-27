const { ActivityType } = require("discord.js");

module.exports = (client) => {
    let random = (int)(Math.random() * 4) + 1;
    
    switch (random) {
        case 1:
            client.user.setActivity({
                name: "with heavy circles",
                type: ActivityType.Playing
            });
            break;
        case 2:
            client.user.setActivity({
                name: "21 Pump Street",
                type: ActivityType.Watching
            });
            break;
        case 3:
            client.user.setActivity({
                name: "the posedown",
                type: ActivityType.Watching
            });
            break;
        case 4:
            client.user.setActivity({
                name: "Clash Royale on the recumbent bike",
                type: ActivityType.Playing
            });
            break;
        default:
            client.user.setActivity({
                name: "with heavy circles",
                type: ActivityType.Playing
            });
            break;  
    }
    setTimeout(this, 1800000); // Every half an hour
}