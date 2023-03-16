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
const { discordToken } = require('./config.json');

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
    return fs.promises
        .readFile(`./data/${guildId}.yml`, 'utf8')
        .then((data) => {
            let yamlData = yaml.load(data);
            serverData.set(guildId, yamlData);
        })
        .catch(() => {
            serverData.set(guildId, {});
            saveData(guildId);
        });
}

async function saveData(guildId) {
    let guildData = yaml.dump(serverData.get(guildId));
    return fs.promises.writeFile(`./data/${guildId}.yml`, guildData, 'utf8');
}

function setEmbed(guildId, messageId, buttonId, title, text, color) {
    let guildData = serverData.get(guildId);
    let allMessageData = guildData['messages'];
    if (allMessageData === undefined) {
        allMessageData = {};
    }
    let thisMessageData = allMessageData[messageId];
    if (thisMessageData === undefined) {
        thisMessageData = {};
    }
    let buttonData = thisMessageData[buttonId];
    if (buttonData === undefined) {
        buttonData = {};
    }
    let embedData = {};
    embedData['title'] = title;
    embedData['text'] = text;
    embedData['color'] = color;

    buttonData['embed'] = embedData;
    thisMessageData[buttonId] = buttonData;
    allMessageData[messageId] = thisMessageData;
    guildData['messages'] = allMessageData;
    console.log(embedData);
    console.log(buttonData);
    console.log(thisMessageData);
    console.log(allMessageData);
    serverData.set(guildId, guildData);
    saveData(guildId);
}

function addRole(guildId, messageId, buttonId, roleId) {
    let guildData = serverData.get(guildId);
    let allMessageData = guildData['messages'];
    if (allMessageData === undefined) {
        allMessageData = {};
    }
    let thisMessageData = allMessageData[messageId];
    if (thisMessageData === undefined) {
        thisMessageData = {};
    }
    let buttonData = thisMessageData[buttonId];
    if (buttonData === undefined) {
        buttonData = {};
    }
    let roleData = buttonData['roles'];
    if (roleData === undefined) {
        roleData = [];
    }
    roleData.push(roleId);

    buttonData['roles'] = roleData;
    thisMessageData[buttonId] = buttonData;
    allMessageData[messageId] = thisMessageData;
    guildData['messages'] = allMessageData;
    serverData.set(guildId, guildData);
    saveData(guildId);
}

function removeRole(guildId, messageId, buttonId, roleId) {
    let guildData = serverData.get(guildId);
    let allMessageData = guildData['messages'];
    let thisMessageData = allMessageData[messageId];
    let buttonData = thisMessageData[buttonId];
    let roleData = buttonData['roles'];

    const roleIndex = roleData.indexOf(roleId);
    if (roleIndex !== -1) {
        roleData.splice(roleIndex, 1);
    }

    buttonData['roles'] = roleData;
    thisMessageData[buttonId] = buttonData;
    allMessageData[messageId] = thisMessageData;
    guildData['messages'] = allMessageData;
    serverData.set(guildId, guildData);
    saveData(guildId);
}

function getRoleCount(guildId, messageId, buttonId) {
    try {
        let guildData = serverData.get(guildId);
        let allMessageData = guildData['messages'];
        let thisMessageData = allMessageData[messageId];
        let buttonData = thisMessageData[buttonId];
        let roleData = buttonData['roles'];
        return roleData.length;
    } catch (e) {
        return 0;
    }
}

function getRoles(guildId, messageId, buttonId) {
    let guildData = serverData.get(guildId);
    let allMessageData = guildData['messages'];
    if (allMessageData === undefined) {
        return [];
    }
    let thisMessageData = allMessageData[messageId];
    if (thisMessageData === undefined) {
        return [];
    }
    let buttonData = thisMessageData[buttonId];
    if (buttonData === undefined) {
        return [];
    }
    let roleData = buttonData['roles'];
    if (roleData === undefined) {
        return [];
    }
    return roleData;
}

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
        const color = interaction.options.getString('color');

        const embed = makeEmbed(title, content, color);

        const channel = interaction.channel;

        if (subcommand === 'create') {
            if (
                !channel
                    .permissionsFor(interaction.guild.members.me)
                    .has('SendMessages')
            ) {
                interaction.reply({
                    content:
                        'Error: No permission to send messages in this channel',
                    ephemeral: true
                });
                return;
            }
            channel.send({ embeds: [embed] });
            interaction.reply({ content: 'Done!', ephemeral: true });
        } else if (subcommand === 'update') {
            const messageId = interaction.options.getString('message');
            channel.messages
                .fetch(messageId)
                .then((message) => {
                    if (message.author.id !== client.user.id) {
                        interaction.reply({
                            content:
                                'Error: Cannot edit a message sent by a different user',
                            ephemeral: true
                        });
                        return;
                    }
                    message.edit({ embeds: [embed] });
                    interaction.reply({ content: 'Done!', ephemeral: true });
                })
                .catch(() => {
                    interaction.reply({
                        content: `Error: Could not find message with ID ${messageId}`,
                        ephemeral: true
                    });
                });
        }
    }

    if (commandName === 'button') {
        const subcommand = interaction.options.getSubcommand();

        const buttonId = interaction.options.getString('id');
        const messageId = interaction.options.getString('message');
        const channel = interaction.channel;

        channel.messages
            .fetch({ limit: 1, around: messageId, cache: false })
            .then((messages) => {
                let message = messages.at(0);
                if (message.author.id !== client.user.id) {
                    interaction.reply({
                        content:
                            'Error: Cannot modify buttons on a message sent by a different user',
                        ephemeral: true
                    });
                    return;
                }

                if (subcommand === 'create') {
                    const title = interaction.options.getString('title');
                    let buttons = getButtons(message);

                    if (buttons.length >= 25) {
                        interaction.reply({
                            content:
                                'Error: A message can have at most 25 buttons',
                            ephemeral: true
                        });
                        return;
                    }

                    let button = makeButton(buttonId, title);
                    buttons.push(button);
                    let rows = buildButtonComponents(buttons);
                    message.edit({ components: rows });
                    interaction.reply({ content: 'Done!', ephemeral: true });
                } else if (subcommand === 'delete') {
                    let buttons = getButtons(message);

                    let buttonIndex = getButtonIndex(buttons, buttonId);
                    if (buttonIndex === -1) {
                        interaction.reply({
                            content: `Error: Could not find button with ID ${buttonId} on message with ID ${messageId}. Use \`/button get\` to get a list of buttons on a message`,
                            ephemeral: true
                        });
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
                        interaction.reply({
                            content: `Error: Could not find button with ID ${buttonId} on message with ID ${messageId}. Use \`/button get\` to get a list of buttons on a message`,
                            ephemeral: true
                        });
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
                    buttons.forEach((button) => {
                        newMsg += `Button name: \`${button.label}\`, button ID: \`${button.customId}\`\n`;
                    });
                    interaction.reply({ content: newMsg, ephemeral: true });
                }
            })
            .catch((error) => {
                console.log(error);
                interaction.reply({
                    content: `Error: Could not find message with ID ${messageId}`,
                    ephemeral: true
                });
            });
    }

    if (commandName === 'role') {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        const buttonId = interaction.options.getString('button');
        const messageId = interaction.options.getString('message');
        const channel = interaction.channel;

        channel.messages
            .fetch({ limit: 1, around: messageId, cache: false })
            .then((messages) => {
                let message = messages.at(0);
                let buttons = getButtons(message);

                let buttonIndex = getButtonIndex(buttons, buttonId);
                if (buttonIndex === -1) {
                    interaction.reply({
                        content: `Error: Could not find button with ID ${buttonId} on message with ID ${messageId}. Use \`/button get\` to get a list of buttons on a message`,
                        ephemeral: true
                    });
                    return;
                }

                if (group === 'embed') {
                    if (subcommand === 'set') {
                        const title = interaction.options.getString('title');
                        const content =
                            interaction.options.getString('content');
                        const color = interaction.options.getString('color');

                        const embed = makeEmbed(title, content, color);
                        setEmbed(
                            interaction.guildId,
                            messageId,
                            buttonId,
                            title,
                            content,
                            color
                        );

                        interaction.reply({
                            content:
                                "Done! Here's what the embed will look like",
                            embeds: [embed],
                            ephemeral: true
                        });
                    } else if (subcommand === 'delete') {
                        setEmbed(
                            interaction.guildId,
                            messageId,
                            buttonId,
                            null,
                            null,
                            null
                        );
                        interaction.reply({
                            content: 'Done!',
                            ephemeral: true
                        });
                    }
                }

                if (group === 'assign') {
                    const role = interaction.options.getRole('role');

                    if (subcommand === 'add') {
                        if (
                            getRoleCount(
                                interaction.guildId,
                                messageId,
                                buttonId
                            ) >= 25
                        ) {
                            interaction.reply({
                                content:
                                    'Error: Maximum of 25 roles on a button',
                                ephemeral: true
                            });
                            return;
                        }
                        if (
                            getRoles(
                                interaction.guildId,
                                messageId,
                                buttonId
                            ).indexOf(role.id) !== -1
                        ) {
                            interaction.reply({
                                content:
                                    'Error: Role is already assigned to this button',
                                ephemeral: true
                            });
                            return;
                        }
                        addRole(
                            interaction.guildId,
                            messageId,
                            buttonId,
                            role.id
                        );
                        interaction.reply({
                            content: 'Done!',
                            ephemeral: true
                        });
                    } else if (subcommand === 'remove') {
                        removeRole(
                            interaction.guildId,
                            messageId,
                            buttonId,
                            role.id
                        );
                        interaction.reply({
                            content: 'Done!',
                            ephemeral: true
                        });
                    }
                }

                if (group === null) {
                    if (subcommand === 'get') {
                        const serverRules = serverData.get(interaction.guildId);

                        // Make sure there's a messages list to handle
                        if (!serverRules.hasOwnProperty('messages')) {
                            interaction.reply({
                                content: 'This server has no set data',
                                ephemeral: true
                            });
                            return;
                        }

                        const messageRules = serverRules['messages'][messageId];

                        // Make sure the message has defined rules
                        if (messageRules === undefined) {
                            interaction.reply({
                                content: 'This message has no set data',
                                ephemeral: true
                            });
                            return;
                        }

                        const buttonRules = messageRules[buttonId];

                        // Make sure the button has defined rules
                        if (
                            buttonRules === undefined ||
                            (buttonRules['roles'] === undefined &&
                                buttonRules['embed'] === undefined)
                        ) {
                            interaction.reply({
                                content: 'This button has no set data',
                                ephemeral: true
                            });
                            return;
                        }

                        const embed = buttonRules['embed'];
                        const roles = buttonRules['roles'];

                        // Roles but no embed
                        if (
                            embed === undefined ||
                            (embed['title'] === null &&
                                embed['text'] === null &&
                                embed['color'] === null)
                        ) {
                            let roleList = '';
                            roles.forEach((roleId) => {
                                roleList += `<@&${roleId}> `;
                            });
                            const embedResponse = makeEmbed(
                                'Roles Assigned',
                                roleList,
                                null
                            );
                            interaction.reply({
                                content:
                                    'There is no embed assigned to this button',
                                embeds: [embedResponse],
                                ephemeral: true
                            });
                            return;
                        }

                        // Embed but no roles
                        if (roles === undefined) {
                            const embedResponse = makeEmbed(
                                embed['title'],
                                embed['text'],
                                embed['color']
                            );
                            interaction.reply({
                                content:
                                    'There are no roles assigned to this button\nAssigned embed',
                                embeds: [embedResponse],
                                ephemeral: true
                            });
                            return;
                        }

                        let roleList = '';
                        roles.forEach((roleId) => {
                            roleList += `<@&${roleId}> `;
                        });
                        const roleResponse = makeEmbed(
                            'Roles Assigned',
                            roleList,
                            null
                        );
                        const embedResponse = makeEmbed(
                            embed['title'],
                            embed['text'],
                            embed['color']
                        );
                        interaction.reply({
                            content: 'Assigned embed and roles shown',
                            embeds: [embedResponse, roleResponse],
                            ephemeral: true
                        });
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                interaction.reply({
                    content: `Error: Could not find message with ID ${messageId}`,
                    ephemeral: true
                });
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
    const serverRules = serverData.get(interaction.guildId);

    // Make sure there's server rules
    if (serverRules === undefined) {
        interaction.reply({
            content:
                'This button has not been setup, contact server administration',
            ephemeral: true
        });
        return;
    }

    // Make sure there's a messages list to handle
    if (!serverRules.hasOwnProperty('messages')) {
        interaction.reply({
            content:
                'This button has not been setup, contact server administration',
            ephemeral: true
        });
        return;
    }

    const messageRules = serverRules['messages'][messageId];

    // Make sure the message has defined rules
    if (messageRules === undefined) {
        interaction.reply({
            content:
                'This button has not been setup, contact server administration',
            ephemeral: true
        });
        return;
    }

    const buttonRules = messageRules[buttonId];

    // Make sure the button has defined rules
    if (buttonRules === undefined) {
        interaction.reply({
            content:
                'This button has not been setup, contact server administration',
            ephemeral: true
        });
        return;
    }

    // If there are no roles assigned to the button, do nothing
    if (buttonRules['roles'] === undefined) {
        interaction.reply({
            content:
                'This button has not been setup, contact server administration',
            ephemeral: true
        });
        return;
    }

    let roles = [];

    await buttonRules['roles'].forEach((roleId) => {
        interaction.guild.roles
            .fetch(roleId)
            .then((role) => {
                roles.push(role);
            })
            .catch((err) => {
                console.log(`Role with ID ${roleId} couldn't be found`);
                console.log(err);
            });
    });

    const component = buildMenuComponents(
        roles,
        interaction.member.roles.cache,
        buttonId
    );

    let embedRules = buttonRules['embed'];

    if (embedRules !== undefined && embedRules['text'] !== null) {
        // Title and color are not required, null them if not present (EmbedBuilder accepts null)
        if (embedRules['title'] === undefined) {
            embedRules['title'] = null;
        }
        if (embedRules['color'] === undefined) {
            embedRules['color'] = null;
        }

        const embed = makeEmbed(
            embedRules['title'],
            embedRules['text'],
            embedRules['color']
        );
        interaction.reply({
            embeds: [embed],
            components: [component],
            ephemeral: true
        });
    } else {
        interaction.reply({ components: [component], ephemeral: true });
    }
});

// Menu handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) {
        return;
    }

    const selection = interaction.values;
    const member = interaction.member;
    const selfMember = interaction.guild.members.me;
    const botHighest = selfMember.roles.highest.position;

    if (!selfMember.permissions.has('ManageRoles')) {
        interaction.reply({
            content:
                'Error: Missing Manage Roles permission, contact server administration',
            ephemeral: true
        });
        return;
    }

    // Get the list of role options for the interaction
    const roleOptions = serverData.get(interaction.guildId)['messages'][
        interaction.message.reference.messageId
    ][interaction.customId]['roles'];

    let errors = '';
    let addedRoles = '';
    let removedRoles = '';

    await roleOptions.forEach((roleOptionId) => {
        interaction.guild.roles.fetch(roleOptionId).then((role) => {
            if (role === null) {
                // Automatically cleanup deleted or invalid roles
                removeRole(
                    interaction.guildId,
                    interaction.message.reference.messageId,
                    interaction.customId,
                    roleOptionId
                );
                return;
            }
            let position = role.position;
            if (position > botHighest) {
                errors += `Error: Cannot modify @${role.name} due to role hierarchy, contact server administration\n`;
                return;
            }

            if (selection.includes(roleOptionId)) {
                if (!member.roles.cache.has(roleOptionId)) {
                    addedRoles += `<@&${roleOptionId}> `;
                    member.roles.add(roleOptionId);
                }
            } else {
                if (member.roles.cache.has(roleOptionId)) {
                    removedRoles += `<@&${roleOptionId}> `;
                    member.roles.remove(roleOptionId);
                }
            }
        });
    });

    let responseMsg = '';
    if (errors !== '') {
        responseMsg += errors;
    }
    if (addedRoles !== '') {
        responseMsg += `Added roles: ${addedRoles}\n`;
    }
    if (removedRoles !== '') {
        responseMsg += `Removed roles: ${removedRoles}`;
    }

    if (responseMsg === '') {
        return;
    }

    const response = makeEmbed(null, responseMsg, null);
    interaction.reply({ embeds: [response], ephemeral: true });
});

// Returns a new embed
function makeEmbed(title, content, color) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(content.replaceAll('\\n', '\n\u200B'))
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
        rows[i / 5] = row;
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
        .setMaxValues(roles.length)
        .setMinValues(0);

    roles.forEach((role) => {
        if (memberRoles.has(role.id)) {
            menuBuilder.addOptions({
                label: role.name,
                value: role.id,
                default: true
            });
        } else {
            menuBuilder.addOptions({
                label: role.name,
                value: role.id
            });
        }
    });

    row.addComponents(menuBuilder);
    return row;
}

client.login(discordToken);
