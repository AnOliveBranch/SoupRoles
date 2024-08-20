const log4js = require('log4js');
const logger = log4js.getLogger('DeleteButtonCommand');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const {
	ActionRowBuilder,
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	StringSelectMenuBuilder,
	EmbedBuilder,
	PermissionFlagsBits
} = require('discord.js');
const { getComponents } = require('../util/utils');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Delete Button(s)')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_ROLES)
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		logger.trace('Got context menu interaction');
		const message = interaction.targetMessage;

		if (message.author.id !== interaction.client.user.id) {
			interaction.reply({
				content: 'Can only delete buttons on messages from SoupRoles!',
				ephemeral: true
			});
			return;
		}

		const buttons = getComponents(message);
		if (buttons.length === 0) {
			interaction.reply({ content: 'No buttons to delete on this message!', ephemeral: true });
			return;
		}

		const row = new ActionRowBuilder();

		const menuBuilder = new StringSelectMenuBuilder()
			.setCustomId('buttonDeleteMenu')
			.setPlaceholder('Select the button(s) to delete')
			.setMinValues(1)
			.setMaxValues(buttons.length);

		buttons.forEach((button) => {
			menuBuilder.addOptions({
				label: `${button.data.label} (${button.data.custom_id})`,
				value: button.data.custom_id
			});
		});

		row.addComponents(menuBuilder);

		const deleteEmbed = new EmbedBuilder()
			.setTitle('Delete button(s)')
			.setDescription('Select the buttons to delete from the dropdown below')
			.setColor('#ff0000')
			.setFooter({ text: `ID: ${message.id}` });
		interaction.reply({ embeds: [deleteEmbed], components: [row], ephemeral: true });
	}
};
