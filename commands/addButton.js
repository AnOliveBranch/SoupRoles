const log4js = require('log4js');
const logger = log4js.getLogger('AddButtonCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger.js');
const logChannel = channels['logChannelId'];

const {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	PermissionFlagsBits
} = require('discord.js');
const { getComponents } = require('../util/utils');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Add Button')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_ROLES)
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		logger.trace('Got context menu interaction');
		const message = interaction.targetMessage;
		if (message.author.id !== interaction.client.user.id) {
			interaction.reply({
				content: 'Can only add buttons on messages from SoupRoles!',
				ephemeral: true
			});
			return;
		}

		const buttons = getComponents(message);
		if (buttons.length >= 25) {
			interaction.reply({
				content: 'Can only have up to 25 buttons on a message!',
				ephemeral: true
			});
		}

		// Build modal
		const modal = new ModalBuilder().setCustomId('buttonModal').setTitle('Create a new button');

		// Build title input
		const titleInput = new TextInputBuilder()
			.setCustomId('buttonTitle')
			.setLabel('Button Title')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Pronouns');

		// Build button ID input
		const buttonIdInput = new TextInputBuilder()
			.setCustomId('buttonId')
			.setLabel('Button ID')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder(`pronounButton`);

		// Build button ID input
		const messageIdInput = new TextInputBuilder()
			.setCustomId('messageId')
			.setLabel('Message ID (do not edit)')
			.setStyle(TextInputStyle.Short)
			.setValue(message.id);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(titleInput);
		const actionRowTwo = new ActionRowBuilder().addComponents(buttonIdInput);
		const actionRowThree = new ActionRowBuilder().addComponents(messageIdInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne, actionRowTwo, actionRowThree);

		logger.debug('Sent modal for adding a button to a message');

		// Show modal
		await interaction.showModal(modal);
	}
};
