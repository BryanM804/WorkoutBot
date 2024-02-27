const { ActivityType } = require("discord.js");

module.exports = (client) => {
    // This is to get it to run once at startup then every half hour from there.
    let intervalTime = 1;

    setInterval(() => {
        let random = Math.floor((Math.random() * 4) + 1)
        
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

        intervalTime = 1800000;// Every half an hour
    }, intervalTime);
}