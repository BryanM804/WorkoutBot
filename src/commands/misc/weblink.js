module.exports = {
    name: "weblink",
    description: "Gives a link to the website.",
    //devOnly: boolean,
    //testOnly: boolean,
    //deleted: boolean,
    callback: (client, interaction) => {
        interaction.reply({ content: "http://www.lifterslog.online/" });
        console.log("Site link requested.")
    }
}