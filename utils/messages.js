const moment = require('moment');

function formatMessage(username, text, id = 0) {
    return {
        username,
        text,
        id,
        time: moment().format("h:mm a"),
    }
}

module.exports = formatMessage