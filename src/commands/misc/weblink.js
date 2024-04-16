module.exports = {
    name: "weblink",
    description: "Gives a link to the website.",
    //devOnly: boolean,
    //testOnly: boolean,
    //deleted: boolean,
    callback: (client, interaction) => {
        interaction.reply({ content: "http://72.68.45.172:5500/ please don't hack me thanks." });
    }
}