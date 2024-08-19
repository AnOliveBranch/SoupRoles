const log4js = require('log4js');
const logger = log4js.getLogger('CommandInteractionEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger.js');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			logger.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			logger.error(error);
			const client = interaction.client;
			const discordLogger = new DiscordLogger(client, logChannel);
			try {
				await discordLogger.init();
			} catch (error) {
				logger.warn(`Failed to initialize DiscordLogger`);
			}
			discordLogger.logMessage('A command encountered an error!');
			discordLogger.logMessage(`Interaction: \n\`\`\`\n${interaction.toString()}\n\`\`\``);
			discordLogger.logMessage(`Error: \n\`\`\`\n${error}\n\`\`\``);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				});
			}
		}
	}
};
