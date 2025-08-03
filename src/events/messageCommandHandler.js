const { readdirSync } = require("fs");
const path = require("path");
const messageHandler = require("../utils/MessageCommandHandler");

const deleteAfterDelay = (messages, delay = 5000) => {
    setTimeout(() => {
        messages.forEach((msg) => msg.delete().catch(console.error));
    }, delay);
};

module.exports = {
    name: "messageCommandHandler",
    async execute(message) {
        await messageHandler.handleMessage(message);
    },
}; 