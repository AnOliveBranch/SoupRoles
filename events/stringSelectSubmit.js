const log4js = require('log4js');
const logger = log4js.getLogger('StringSelectEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger.js');
const logChannel = channels['logChannelId'];

const {
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder
} = require('discord.js');
const { getComponents, buildActionRows } = require('../util/utils');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;

		const menuId = interaction.customId;
		const selection = interaction.values;

		if (menuId === 'buttonDeleteMenu') {
			await interaction.deferReply({ ephemeral: true });

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
				interaction.editReply(
					'Encountered an error fetching message. Contact staff if the issue persists.'
				);
				return;
			}

			const embed = embeds[0];
			const messageID = embed.footer.text.split('ID: ')[1];

			interaction.channel.messages
				.fetch(messageID)
				.then((message) => {
					const buttons = getComponents(message);
					let newList = [];
					buttons.forEach((button) => {
						if (!selection.includes(button.data.custom_id)) {
							newList.push(button);
						}
					});

					let components;
					if (newList.length === 0) {
						components = [];
					} else {
						components = buildActionRows(newList);
					}

					message
						.edit({ components: components })
						.then(() => {
							interaction.editReply('Deleted the button(s) from the message');
						})
						.catch((error) => {
							logger.error(error);
							interaction.editReply(
								'Failed to delete the button(s) from the message. Contact staff if the issue persists.'
							);
							discordLogger.logMessage('Failed to delete button(s)!').then(() => {
								discordLogger.logMessage(error);
							});
						});
				})
				.catch((error) => {
					interaction.editReply('Failed to fetch message!');
					logger.error(error);
					discordLogger.logMessage('Failed to fetch message for delete button!').then(() => {
						discordLogger.logMessage(error);
					});
				});
		} else if (menuId === 'buttonEditMenu') {
			const message = interaction.message;
			const embeds = message.embeds;
			if (embeds.length !== 1) {
				interaction.reply({
					content: 'Encountered an error fetching message. Contact staff if the issue persists.',
					ephemeral: true
				});
				return;
			}

			const embed = embeds[0];
			const messageID = embed.footer.text.split('ID: ')[1];

			// Build modal
			const modal = new ModalBuilder()
				.setCustomId('buttonEditModal')
				.setTitle('Edits a button title');

			// Build title input
			const titleInput = new TextInputBuilder()
				.setCustomId('buttonTitle')
				.setLabel('Button Title')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('New role title');

			// Build button ID input
			const buttonIdInput = new TextInputBuilder()
				.setCustomId('buttonId')
				.setLabel('Button ID (do not edit)')
				.setStyle(TextInputStyle.Short)
				.setValue(selection[0]);

			// Build button ID input
			const messageIdInput = new TextInputBuilder()
				.setCustomId('messageId')
				.setLabel('Message ID (do not edit)')
				.setStyle(TextInputStyle.Short)
				.setValue(messageID);

			// Create action rows
			const actionRowOne = new ActionRowBuilder().addComponents(titleInput);
			const actionRowTwo = new ActionRowBuilder().addComponents(buttonIdInput);
			const actionRowThree = new ActionRowBuilder().addComponents(messageIdInput);

			// Add action rows to modal
			modal.addComponents(actionRowOne, actionRowTwo, actionRowThree);

			logger.debug('Sent modal for editing a button');

			// Show modal
			await interaction.showModal(modal);
		}
	}
};
