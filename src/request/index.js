/* eslint no-console: "off" */
const request = require('./request');

const ACTIONS = 'startGame nextWord guessWord getResult';

ACTIONS.split(' ').forEach((action) => {
    exports[action] = (data) => {
        const postData = Object.assign({}, {
            action,
        }, data);
        return request(postData)
                .catch((msg) => {
                    console.log(`${action}: ${msg}!`);
                    return request(postData);
                });
    };
});
