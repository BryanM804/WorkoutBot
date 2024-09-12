module.exports = (movement, weight, reps, sets, date) => {
    let replyString = "";

    if (sets > 1 && weight >= 1) {
        replyString = `Logged ${sets} sets of ${movement} ${weight}lbs for ${reps} reps`;
    } else if (sets > 1) {
        replyString = `Logged ${sets} sets of ${movement} for ${reps} reps`;
    } else if (weight >= 1) {
        replyString = `Logged ${movement} ${weight}lbs for ${reps} reps`;
    } else {
        replyString = `Logged ${movement} for ${reps} reps`;
    }

    if (date) {
        replyString += ` on ${date}`;
    }

    return replyString
}