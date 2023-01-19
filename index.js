const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require('discord.js');
const {
    discordToken
} = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

function makeEmbed(title, content, footer, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setFooter(footer)
        .setColor(color)
        .build();
}

client.login(discordToken);