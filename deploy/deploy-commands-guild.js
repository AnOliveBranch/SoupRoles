const { REST, SlashCommandBuilder, PermissionFlagsBits, Routes } = require('discord.js');
const { clientId, guildId, discordToken } = require('../config.json');

const commands = [
    new SlashCommandBuilder().setName('embed')
        .setDescription('Command for creating and updating embeds')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Creates a new embed')
                .addStringOption(option =>
                    option
                        .setName('content')
                        .setDescription('Content of the embed')
                        .setRequired(true)    
                )
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setDescription('Title of the embed')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('color')
                        .setDescription('Hex or RGB color of the embed')
                        .setRequired(false)    
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to post the embed in (defaults to current channel)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Updates an existing embed created by this bot')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Message ID of the message to update')
                        .setRequired(true)    
                )
                .addStringOption(option =>
                    option
                        .setName('content')
                        .setDescription('Content of the embed')
                        .setRequired(true)    
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel the message is in (defaults to current channel)')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setDescription('Title of the embed')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('color')
                        .setDescription('Hex or RGB color of the embed')
                        .setRequired(false)    
                )
        ),
    new SlashCommandBuilder().setName('button')
        .setDescription('Command for creating and updating buttons')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand => 
            subcommand
                .setName('create')
                .setDescription('Creates a button on a message')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Message ID of message to add button to')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('Unique ID of the button')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setDescription('Text of the button')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel the message is in (defaults to current channel)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('update')
                .setDescription('Updates a button on a message')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Message ID of message to update button for')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('Unique ID of the button')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('newtitle')
                        .setDescription('New text of the button')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel the message is in (defaults to current channel)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('delete')
                .setDescription('Deletes a button on a message')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Message ID of message to delete button from')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('Unique ID of the button')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel the message is in (defaults to current channel)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Gets all buttons on a message')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Message ID of message to get buttons from')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel the message is in (defaults to current channel)')
                        .setRequired(false)
                )
        ),
    new SlashCommandBuilder().setName('role')
        .setDescription('Command for assigning roles to a button')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommandGroup(group => 
            group
                .setName('embed')
                .setDescription('Modify embeds tied to a button')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('create')
                        .setDescription('Create an embed for a button')
                        .addStringOption(option =>
                            option
                                .setName('message')
                                .setDescription('Message ID of the message the button is on')
                                .setRequired(true)    
                        )
                        .addStringOption(option =>
                            option
                                .setName('button')
                                .setDescription('Custom ID of the button to create an embed for')
                                .setRequired(true)    
                        )
                        .addStringOption(option =>
                            option
                                .setName('content')
                                .setDescription('Body text of the embed')
                                .setRequired(true)    
                        )
                        .addStringOption(option =>
                            option
                                .setName('title')
                                .setDescription('Title of the embed') 
                        )
                        .addStringOption(option =>
                            option
                                .setName('color')
                                .setDescription('Color of the embed')    
                        )
                        .addChannelOption(option =>
                            option
                                .setName('channel')
                                .setDescription('Channel the message is in')    
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('update')
                        .setDescription('Update an embed for a button')
                        .addStringOption(option =>
                            option
                                .setName('message')
                                .setDescription('Message ID of the message the button is on')
                                .setRequired(true)    
                        )
                        .addStringOption(option =>
                            option
                                .setName('button')
                                .setDescription('Custom ID of the button to update the embed for')
                                .setRequired(true)    
                        )
                        .addStringOption(option =>
                            option
                                .setName('content')
                                .setDescription('New body text of the embed')
                                .setRequired(true)    
                        )
                        .addStringOption(option =>
                            option
                                .setName('title')
                                .setDescription('Title of the embed') 
                        )
                        .addStringOption(option =>
                            option
                                .setName('color')
                                .setDescription('Color of the embed')    
                        )
                        .addChannelOption(option =>
                            option
                                .setName('channel')
                                .setDescription('Channel the message is in')    
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('delete')
                        .setDescription('Delete an embed for a button')
                        .addStringOption(option =>
                            option
                                .setName('message')
                                .setDescription('Message ID of the message the button is on')
                                .setRequired(true)    
                        )
                        .addStringOption(option =>
                            option
                                .setName('button')
                                .setDescription('Custom ID of the button to delete the embed for')
                                .setRequired(true)    
                        )
                        .addChannelOption(option =>
                            option
                                .setName('channel')
                                .setDescription('Channel the message is in')    
                        )
                )
        )
]
.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(discordToken);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);
