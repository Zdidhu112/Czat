const moment = require('moment');

function formatMessage(username, text, user, _id) {
    return {
        username,
        text,
        user,
        _id,
        time: moment().format("h:mm a"),
    }
}

module.exports = formatMessage