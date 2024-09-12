module.exports = (userAccount) => {
    let restDaysString = "";
    for (let i = 0; i < userAccount.restDays.length; i++) {
        switch (parseInt(userAccount.restDays[i])) {
            case 0:
                restDaysString += "Sunday";
                break;
            case 1:
                restDaysString += "Monday";
                break;
            case 2:
                restDaysString += "Tuesday";
                break;
            case 3:
                restDaysString += "Wednesday";
                break;
            case 4:
                restDaysString += "Thursday";
                break;
            case 5:
                restDaysString += "Friday";
                break;
            case 6:
                restDaysString += "Saturday";
                break;
        }
        if (i != userAccount.restDays.length - 1) {
            restDaysString += ", ";
        }
    }
    if (restDaysString.length < 1) {
        restDaysString = "None"
    }
    return restDaysString;
}