const { REST, SlashCommandBuilder, Routes } = require('discord.js');
const { clientId, guildId, discordToken } = require('../config.json');

const commands = [
    new SlashCommandBuilder().setName('embed')
        .setDescription('Command for creating and updating embeds')
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
                        .setDescription('Hex color of the embed (no #)')
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
                        .setName('content')
                        .setDescription('Content of the embed')
                        .setRequired(true)    
                )
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Message ID of the message to update')
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
                        .setDescription('Hex color of the embed (no #)')
                        .setRequired(false)    
                )
        ),
    new SlashCommandBuilder().setName('button')
        .setDescription('Command for creating and updating buttons')
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
        )
]
.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(discordToken);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);
