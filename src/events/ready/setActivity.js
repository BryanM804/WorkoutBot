const { ActivityType } = require("discord.js");
module.exports = (client) => {
    client.user.setActivity({
        name: "with heavy circles",
        type: ActivityType.Playing
    });
}