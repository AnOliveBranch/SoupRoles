const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');
const {
    discordToken
} = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let serverData = new Map();

client.once('ready', () => {
    fs.promises.mkdir('./data', { recursive: true }).then(() => {
        client.guilds.cache.forEach((guild) => {
            loadData(guild.id);
        });
    });
    
    console.log(`Logged in as ${client.user.tag}`);
});

async function loadData(guildId) {
    return fs.promises.readFile(`./data/${guildId}.yml`, 'utf8').then((data) => {
        let yamlData = yaml.load(data);
        serverData.set(guildId, yamlData);
    }).catch(() => {
        serverData.set(guildId, {});
        saveData(guildId);
    });
}

async function saveData(guildId) {
    let guildData = yaml.dump(serverData.get(guildId));
    return fs.promises.writeFile(`./data/${guildId}.yml`, guildData, 'utf8');
}

// Command handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (!interaction.inGuild()) {
        interaction.reply({ content: 'This bot does not support DMs', ephemeral: true });
        return;
    }

    const { commandName } = interaction;

    if (commandName === 'embed') {
        const subcommand = interaction.options.getSubcommand();

        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');

        const color = interaction.options.getString('color');

        const embed = makeEmbed(title, content, color);

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
                let rows = buildButtonComponents(buttons);
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
                let rows = buildButtonComponents(buttons);
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

                let rows = buildButtonComponents(buttons);
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

// Button handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }

    const messageId = interaction.message.id;
    const buttonId = interaction.customId;
    const serverRules = serverData.get(interaction.guild.id);

    // Make sure there's a messages list to handle
    if (!serverRules.hasOwnProperty('messages')) {
        return;
    }

    const messageRules = serverRules['messages'][messageId];

    // Make sure the message has defined rules
    if (messageRules === undefined) {
        return;
    }

    const buttonRules = messageRules[buttonId];

    // Make sure the button has defined rules
    if (buttonRules === undefined) {
        return;
    }

    let embedRules = buttonRules['embed'];

    // Title and color are not required, null them if not present (EmbedBuilder accepts null)
    if (embedRules['title'] === undefined) {
        embedRules['title'] = null;
    }
    if (embedRules['color'] === undefined) {
        embedRules['color'] = null;
    }

    const embed = makeEmbed(embedRules['title'], embedRules['text'], embedRules['color']);
    
    let roles = [];

    await buttonRules['roles'].forEach((roleId) => {
        interaction.guild.roles.fetch(roleId).then((role) => {
            roles.push(role);
        }).catch((err) => {
            console.log(`Role with ID ${roleId} couldn't be found`);
            console.log(err);
        });
    });

    const component = buildMenuComponents(roles, interaction.member.roles.cache, buttonId);

    interaction.reply({ embeds: [embed], components: [component], ephemeral: true });
});

// Menu handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) {
        return;
    }

    const selection = interaction.values;
    const member = interaction.member;

    // Get the list of role options for the interaction
    const roleOptions = serverData.get(interaction.guild.id)['messages'][interaction.message.reference.messageId][interaction.customId]['roles'];

    let addedRoles = '';
    let removedRoles = '';
    
    await roleOptions.forEach((roleOptionId) => {
        if (selection.includes(roleOptionId)) {
            if (!member.roles.cache.has(roleOptionId)) {
                addedRoles += `<@&${roleOptionId}> `;
                member.roles.add(roleOptionId);
            }
        } else {
            if (member.roles.cache.has(roleOptionId)) {
                removedRoles +=`<@&${roleOptionId}> `;
                member.roles.remove(roleOptionId);
            }
        }
    });

    if (addedRoles !== '' && removedRoles !== '') {
        const response = makeEmbed(null, `Added roles: ${addedRoles}\nRemoved roles: ${removedRoles}`, null);
        interaction.reply({ embeds: [response], ephemeral: true });
    } else if (addedRoles === '') {
        const response = makeEmbed(null, `Removed roles: ${removedRoles}`, null);
        interaction.reply({ embeds: [response], ephemeral: true });
    } else if (removedRoles === '') {
        const response = makeEmbed(null, `Added roles: ${addedRoles}`, null);
        interaction.reply({ embeds: [response], ephemeral: true });
    } else {
        const response = makeEmbed(null, `No changes were made`, null);
        interaction.reply({ embeds: [response], ephemeral: true });
    }
    
});

// Returns a new embed
function makeEmbed(title, content, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
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
    message.components.forEach((componentRow) => {
        componentRow.components.forEach((component) => {
            buttons.push(component);
        });
    });
    return buttons;
}

// Returns an array of ActionRowBuilders, populated with the contents of the "buttons" array
function buildButtonComponents(buttons) {
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
    return buttons.findIndex((button) => button.customId === buttonId);
}

function buildMenuComponents(roles, memberRoles, buttonId) {
    let row = new ActionRowBuilder();
    let menuBuilder = new StringSelectMenuBuilder()
        .setCustomId(buttonId)
        .setPlaceholder('Select role(s)')
        .setMaxValues(roles.length);

    roles.forEach((role) => {
        if (memberRoles.has(role.id)) {
            menuBuilder.addOptions(
                {
                    label: role.name,
                    value: role.id,
                    default: true
                }
            );
        } else {
            menuBuilder.addOptions(
                {
                    label: role.name,
                    value: role.id
                }
            );
        }
    });

    row.addComponents(menuBuilder);
    return row;
}

client.login(discordToken);