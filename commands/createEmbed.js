const {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	SlashCommandBuilder,
	PermissionFlagsBits
} = require('discord.js');
const { GuildManager } = require('../util/GuildManager.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createembed')
		.setDescription('Creates a new role message')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_ROLES),
	async execute(interaction) {
		// Build modal
		const modal = new ModalBuilder().setCustomId('roleModal').setTitle('Create a role embed');

		// Build title input
		const titleInput = new TextInputBuilder()
			.setCustomId('roleEmbedTitle')
			.setLabel('Embed Title')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Get your roles!');

		// Build body text input
		const bodyTextInput = new TextInputBuilder()
			.setCustomId('roleEmbedBody')
			.setLabel('Embed Body')
			.setStyle(TextInputStyle.Paragraph).setPlaceholder(`
                Use the buttons below to assign your roles!
            `);

		// Build color input
		const colorInput = new TextInputBuilder()
			.setCustomId('roleEmbedColor')
			.setLabel('Embed Color')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Hex color for embed, "None" for no color');

		// Create action rows
		const actionRowOne = new ActionRowBuilder().addComponents(titleInput);
		const actionRowTwo = new ActionRowBuilder().addComponents(bodyTextInput);
		const actionRowThree = new ActionRowBuilder().addComponents(colorInput);

		// Add action rows to modal
		modal.addComponents(actionRowOne, actionRowTwo, actionRowThree);

		// Show modal
		await interaction.showModal(modal);
	}
};
