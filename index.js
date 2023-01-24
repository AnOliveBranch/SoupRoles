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

// Command handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const { commandName } = interaction;

    if (commandName === 'embed') {
        const subcommand = interaction.options.getSubcommand();

        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');
        const footer = interaction.options.getString('footer');
        const color = interaction.options.getString('color');

        const embed = makeEmbed(title, content, footer, color);

        const channel = interaction.options.getChannel('channel') === null ? interaction.channel : interaction.options.getChannel('channel');
 
        if (subcommand === 'create') {
            channel.send({ embeds: [embed] });
            interaction.reply({ content: 'Done!', ephemeral: true });
        } else if (subcommand === 'update') {
            const messageId = interaction.options.getString('message');
            channel.messages.fetch(messageId).then((message) => {
                if (message.author !== client.user) {
                    interaction.reply({ content: 'Error: Cannot edit a message sent by a different user', ephemeral: true });
                    return;
                }
                message.edit({ embeds: [embed] });
                interaction.reply({ content: 'Done!', ephemeral: true });
            }).catch(() => {
                interaction.reply({ content: `Error: Could not find message with ID ${messageId} in channel ${channel}`, ephemeral: true })
            })
        }
    }
});

function makeEmbed(title, content, footer, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setFooter(footer)
        .setColor(color);
}

client.login(discordToken);