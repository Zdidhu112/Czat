const moment = require('moment');

function formatMessage(username, text, user) {
    return {
        username,
        text,
        user,
        time: moment().format("h:mm a"),
    }
}

module.exports = formatMessage