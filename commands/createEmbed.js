const log4js = require('log4js');
const logger = log4js.getLogger('CreateEmbedCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger.js');
const logChannel = channels['logChannelId'];

const {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	SlashCommandBuilder,
	PermissionFlagsBits
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createembed')
		.setDescription('Creates a new role embed message')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_ROLES),
	async execute(interaction) {
		// Build modal
		const modal = new ModalBuilder().setCustomId('embedCreateModal').setTitle('Create an embed');

		// Build title input
		const titleInput = new TextInputBuilder()
			.setCustomId('embedTitle')
			.setLabel('Embed Title')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Get your roles!');

		// Build body text input
		const bodyTextInput = new TextInputBuilder()
			.setCustomId('embedBody')
			.setLabel('Embed Body')
			.setStyle(TextInputStyle.Paragraph).setPlaceholder(`
                Use the buttons below to assign your roles!
            `);

		// Build color input
		const colorInput = new TextInputBuilder()
			.setCustomId('embedColor')
			.setLabel('Embed Color')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Hex color for embed, "None" for no color');

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(titleInput);
		const actionRowTwo = new ActionRowBuilder().addComponents(bodyTextInput);
		const actionRowThree = new ActionRowBuilder().addComponents(colorInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne, actionRowTwo, actionRowThree);

		logger.debug('Sent modal for creating new embed');

		// Show modal
		await interaction.showModal(modal);
	}
};
