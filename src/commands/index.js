const fs = require("fs");
const path = require("path");

function loadCommands(client) {
    const commands = [];
    const commandFolders = fs
        .readdirSync(__dirname)
        .filter((folder) =>
            fs.statSync(path.join(__dirname, folder)).isDirectory()
        );

    for (const folder of commandFolders) {
        const commandFiles = fs
            .readdirSync(path.join(__dirname, folder))
            .filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(path.join(__dirname, folder, file));
            if (command.data) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log(`✅ Đã tải lệnh: ${command.data.name} (${folder})`);
            }
        }
    }

    return commands;
}

module.exports = { loadCommands };
