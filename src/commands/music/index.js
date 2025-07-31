const { EmbedBuilder } = require("discord.js");
const { Kazagumo } = require("kazagumo");
const { Connectors } = require("shoukaku");
const { formatDuration, getLoopStatus } = require("./utils");

// Lavalink nodes configuration
const Nodes = [
    {
        name: "Main",
        url: process.env.LAVALINK_URL,
        auth: process.env.LAVALINK_AUTH,
        secure: false,
    },
];

// Initialize music system
function initializeMusic(client) {
    // Initialize Kazagumo
    const kazagumo = new Kazagumo(
        {
            defaultSearchEngine: "youtube",
            send: (guildId, payload) => {
                const guild = client.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            },
            reconnectTries: 5,
            reconnectInterval: 5000,
            moveOnDisconnect: true,
            voiceConnectionTimeout: 30000,
        },
        new Connectors.DiscordJS(client),
        Nodes
    );

    // Set up event handlers
    kazagumo.shoukaku.on("ready", (name) =>
        console.log(`Lavalink ${name}: Ready!`)
    );
    kazagumo.shoukaku.on("error", (name, error) =>
        console.error(`Lavalink ${name}: Error Caught,`, error)
    );
    kazagumo.shoukaku.on("close", (name, code, reason) =>
        console.warn(
            `Lavalink ${name}: Closed, Code ${code}, Reason ${
                reason || "No reason"
            }`
        )
    );
    kazagumo.shoukaku.on("debug", (name, info) =>
        console.debug(`Lavalink ${name}: Debug,`, info)
    );
    kazagumo.shoukaku.on("disconnect", (name, count) => {
        console.warn(`Lavalink ${name}: Disconnected, Attempt ${count}`);
        setTimeout(() => {
            kazagumo.shoukaku.reconnect(name);
        }, 5000);
    });

    // Player events
    kazagumo.on("playerStart", (player, track) => {
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription(
                `\`🎵\` Đang phát bài hát: \`[${track.title}](${track.uri})\`\n\n` +
                    `\`⏱️\` Thời lượng: \`${formatDuration(track.length)}\`\n` +
                    `\`📋\` Hàng đợi: \`${
                        player.queue.length
                    } bài (${formatDuration(
                        player.queue.reduce(
                            (acc, track) => acc + track.length,
                            0
                        )
                    )})\`\n` +
                    `\`🔊\` Âm lượng: \`${player.volume}%\`\n` +
                    `\`🔄\` Chế độ lặp: \`${getLoopStatus(player.loop)}\``
            )
            .setThumbnail(track.thumbnail)
            .setFooter({ text: `From CAPTAIN BOY with ❤️` })
            .setTimestamp();

        client.channels.cache
            .get(player.textId)
            ?.send({ embeds: [embed] })
            .then((x) => player.data.set("message", x));
    });

    kazagumo.on("playerEnd", (player) => {
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription("`⏹️` Đã kết thúc bài hát`")
            .setFooter({ text: `From CAPTAIN BOY with ❤️` })
            .setTimestamp();

        player.data.get("message")?.edit({ embeds: [embed] });

        // Handle repeat modes
        if (player.loop === "track") {
            player.play(player.queue.previous[0]);
        } else if (player.loop === "queue") {
            if (player.queue.previous.length > 0) {
                const previousTrack = player.queue.previous[0];
                if (player.queue.length === 0) {
                    player.queue.add(player.queue.previous);
                }
                player.queue.add(previousTrack);
            }
        }
    });

    kazagumo.on("playerEmpty", (player) => {
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription("`🔴` Đã dừng phát nhạc do không có hoạt động`")
            .setFooter({ text: `From CAPTAIN BOY with ❤️` })
            .setTimestamp();

        client.channels.cache
            .get(player.textId)
            ?.send({ embeds: [embed] })
            .then((x) => player.data.set("message", x));
        player.destroy();
    });

    // Export Kazagumo instance
    global.kazagumo = kazagumo;
}

module.exports = initializeMusic;
