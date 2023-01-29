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
 
        channel.messages.fetch({ limit: 1, around: messageId, cache: false }).then((messages) => {
            let message = messages.at(0);
            if (message.author.id !== client.user.id) {
                interaction.reply({ content: 'Error: Cannot modify buttons on a message sent by a different user', ephemeral: true });
                return;
            }
    
            if (subcommand === 'create') {
                const title = interaction.options.getString('title');
                let buttons = getButtons(message);

                if (buttons.length >= 25) {
                    interaction.reply({ content: 'Error: A message can have at most 25 buttons', ephemeral: true });
                    return;
                }

                let button = makeButton(buttonId, title);
                buttons.push(button);
                let rows = buildComponents(buttons);
                message.edit({ components: rows });
                interaction.reply({ content: 'Done!', ephemeral: true });
            } else if (subcommand === 'delete') {
                const title = interaction.options.getString('title');
                let buttons = getButtons(message);
                
                let buttonIndex = getButtonIndex(buttons, buttonId);
                if (buttonIndex === -1) {
                    interaction.reply({ content: `Error: Could not find button with ID ${buttonId} on message with ID ${messageId}. Use \`/button get\` to get a list of buttons on a message`, ephemeral: true });
                    return;
                }

                buttons.splice(buttonIndex, 1);
                let rows = buildComponents(buttons);
                message.edit({ components: rows });
                interaction.reply({ content: 'Done!', ephemeral: true });
            } else if (subcommand === 'update') {
                const title = interaction.options.getString('newtitle');
                let buttons = getButtons(message);

                let buttonIndex = getButtonIndex(buttons, buttonId);
                if (buttonIndex === -1) {
                    interaction.reply({ content: `Error: Could not find button with ID ${buttonId} on message with ID ${messageId}. Use \`/button get\` to get a list of buttons on a message`, ephemeral: true });
                    return;
                }

                let button = makeButton(buttonId, title);
                buttons[buttonIndex] = button;

                let rows = buildComponents(buttons);
                message.edit({ components: rows });
                interaction.reply({ content: 'Done!', ephemeral: true });
            } else if (subcommand === 'get') {
                const buttons = getButtons(message);
                let newMsg = '';
                buttons.forEach(function (button) {
                    newMsg += `Button name: \`${button.label}\`, button ID: \`${button.customId}\`\n`;
                });
                interaction.reply({ content: newMsg, ephemeral: true });
            }
        }).catch((error) => {
            console.log(error);
            interaction.reply({ content: `Error: Could not find message with ID ${messageId} in channel ${channel}`, ephemeral: true });
        });
    }
});

// Returns a new embed
function makeEmbed(title, content, footer, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setFooter(footer)
        .setColor(color);
}

// Returns a new button
function makeButton(id, title) {
    return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(title)
        .setStyle(ButtonStyle.Primary);
}

// Returns an array of buttons in a message
function getButtons(message) {
    let buttons = [];
    message.components.forEach(function (componentRow) {
        componentRow.components.forEach(function (component) {
            buttons.push(component);
        });
    });
    return buttons;
}

// Returns an array of ActionRowBuilders, populated with the contents of the "buttons" array
function buildComponents(buttons) {
    let rows = [];
    for (let i = 0; i < buttons.length; i++) {
        let row;
        if (i % 5 === 0) {
            row = new ActionRowBuilder();
        } else {
            row = rows[rows.length - 1];
        }
        row.addComponents(buttons[i]);
        rows[i/5] = row;
    }
    return rows;
}

// Returns the array index of button with ID buttonId in array buttons
function getButtonIndex(buttons, buttonId) {
    let index = -1;
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].customId === buttonId) {
            return i;
        }
    }
    return index;
}

client.login(discordToken);