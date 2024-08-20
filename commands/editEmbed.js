const log4js = require('log4js');
const logger = log4js.getLogger('EditEmbedCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
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

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Edit Embed')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_ROLES)
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		const message = interaction.targetMessage;
		if (message.author.id !== interaction.client.user.id) {
			interaction.reply({
				content: 'Can only edit messages from SoupRoles!',
				ephemeral: true
			});
			return;
		}

		// Get current embed
		const embeds = message.embeds;
		if (embeds.length === 0) {
			interaction.reply({
				content: 'No embed to edit!',
				ephemeral: true
			});
			return;
		} else if (embeds.length > 1) {
			interaction.reply({
				content: 'Too many embeds on this message!',
				ephemeral: true
			});
			return;
		}

		const embed = embeds[0];

		// Build modal
		const modal = new ModalBuilder().setCustomId('embedEditModal').setTitle('Edits an embed');

		// Build title input
		const titleInput = new TextInputBuilder()
			.setCustomId('embedTitle')
			.setLabel('New Embed Title')
			.setStyle(TextInputStyle.Short)
			.setValue(embed.data.title);

		// Build body text input
		const bodyTextInput = new TextInputBuilder()
			.setCustomId('embedBody')
			.setLabel('New Embed Body')
			.setStyle(TextInputStyle.Paragraph)
			.setValue(embed.data.description);

		// Build color input
		const colorInput = new TextInputBuilder()
			.setCustomId('embedColor')
			.setLabel('New Embed Color')
			.setStyle(TextInputStyle.Short)
			.setValue(embed.data.hexColor ?? 'None');

		// Build button ID input
		const messageIdInput = new TextInputBuilder()
			.setCustomId('messageId')
			.setLabel('Message ID (do not edit)')
			.setStyle(TextInputStyle.Short)
			.setValue(message.id);

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(titleInput);
		const actionRowTwo = new ActionRowBuilder().addComponents(bodyTextInput);
		const actionRowThree = new ActionRowBuilder().addComponents(colorInput);
		const actionRowFour = new ActionRowBuilder().addComponents(messageIdInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne, actionRowTwo, actionRowThree, actionRowFour);

		logger.debug('Sent modal for editing an embed');

		// Show modal
		await interaction.showModal(modal);
	}
};
