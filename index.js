const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle
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
                if (message.author.id !== client.user.id) {
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

    if (commandName === 'button') {
        const subcommand = interaction.options.getSubcommand();

        const buttonId = interaction.options.getString('id');
        const messageId = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') === null ? interaction.channel : interaction.options.getChannel('channel');
 
        channel.messages.fetch(messageId).then((message) => {
            console.log(message);
            if (message.author.id !== client.user.id) {
                interaction.reply({ content: 'Error: Cannot modify buttons on a message sent by a different user', ephemeral: true });
                return;
            }
    
            if (subcommand === 'create') {
                const title = interaction.options.getString('title');
    
                let button = makeButton(buttonId, title);
            } else if (subcommand === 'delete') {
                const title = interaction.options.getString('title');
            } else if (subcommand === 'update') {
                const title = interaction.options.getString('newTitle');
    
                let button = makeButton(buttonId, title);
            }
        }).catch((error) => {
            console.log(error);
            interaction.reply({ content: `Error: Could not find message with ID ${messageId} in channel ${channel}`, ephemeral: true });
        });
    }
});

function makeEmbed(title, content, footer, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setFooter(footer)
        .setColor(color);
}

function makeButton(id, title) {
    return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(title)
        .setStyle(ButtonStyle.Primary);
}

client.login(discordToken);