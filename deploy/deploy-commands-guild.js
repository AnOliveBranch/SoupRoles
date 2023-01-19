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
                        .setName('title')
                        .setDescription('Title of the embed')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('content')
                        .setDescription('Content of the embed')
                        .setRequired(false)    
                )
                .addStringOption(option =>
                    option
                        .setName('footer')
                        .setDescription('Footer of the embed')
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
                        .setDescription('Channel to post the embed in')
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
                        .setName('title')
                        .setDescription('Title of the embed')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName('content')
                        .setDescription('Content of the embed')
                        .setRequired(false)    
                )
                .addStringOption(option =>
                    option
                        .setName('footer')
                        .setDescription('Footer of the embed')
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
                        .setDescription('Channel to post the embed in')
                        .setRequired(false)
                )
        )
]
.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(discordToken);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);
