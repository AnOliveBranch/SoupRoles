const log4js = require('log4js');
const logger = log4js.getLogger('StringSelectEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const {
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	EmbedBuilder,
	RoleSelectMenuBuilder
} = require('discord.js');
const { getComponents, buildActionRows } = require('../util/utils');
const { RoleManager } = require('../util/RoleManager');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isRoleSelectMenu()) return;

		const menuId = interaction.customId;
		const selection = interaction.values;

		if (menuId === 'roleSelectMenu') {
			const client = interaction.client;
			const discordLogger = new DiscordLogger(client, logChannel);
			try {
				await discordLogger.init();
			} catch (error) {
				logger.warn(`Failed to initialize DiscordLogger`);
			}

			const message = interaction.message;
			const embeds = message.embeds;
			if (embeds.length !== 1) {
				interaction.reply({
					content: 'Encountered an error fetching message. Contact staff if the issue persists.',
					ephemeral: true
				});
				discordLogger.logMessage('Embeds != 1 on role selection message!');
				return;
			}

			const embed = embeds[0];
			const buttonID = embed.title.split('Set roles: ')[1];
			const messageID = embed.footer.text.split('ID: ')[1];

			const roleManager = new RoleManager();
			try {
				await roleManager.init();
			} catch (error) {
				logger.error(`Failed to initialize RoleManager`);
				interaction.reply({
					content: 'Failed to save roles! Contact staff if the issue persists.',
					ephemeral: true
				});
				return;
			}

			roleManager
				.setRoles(messageID, buttonID, selection)
				.then(() => {
					interaction.reply({ content: 'Your role selections have been saved!', ephemeral: true });
				})
				.catch((error) => {
					logger.error(error);
					interaction.reply({
						content: 'Failed to save roles! Contact staff if the issue persists.',
						ephemeral: true
					});
					discordLogger.logMessage('An error occurred saving roles!').then(() => {
						discordLogger.logMessage(error);
					});
				});
		}
	}
};
