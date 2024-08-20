const log4js = require('log4js');
const logger = log4js.getLogger('SetRolesCommand');
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
		.setName('Set Roles')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_ROLES)
		.setType(ApplicationCommandType.Message),
	async execute(interaction) {
		logger.trace('Got context menu interaction');
		const message = interaction.targetMessage;

		if (message.author.id !== interaction.client.user.id) {
			interaction.reply({
				content: 'Can only set roles on messages from SoupRoles!',
				ephemeral: true
			});
			return;
		}

		const buttons = getComponents(message);
		if (buttons.length === 0) {
			interaction.reply({
				content: 'No buttons to set roles for on this message!',
				ephemeral: true
			});
			return;
		}
		const row = new ActionRowBuilder();

		const menuBuilder = new StringSelectMenuBuilder()
			.setCustomId('buttonSelectMenu')
			.setPlaceholder('Select the button to set roles for')
			.setMinValues(1)
			.setMaxValues(1);

		buttons.forEach((button) => {
			menuBuilder.addOptions({
				label: `${button.data.label} (${button.data.custom_id})`,
				value: button.data.custom_id
			});
		});

		row.addComponents(menuBuilder);

		const editEmbed = new EmbedBuilder()
			.setTitle('Set roles')
			.setDescription('Select the button to set roles for from the dropdown below')
			.setColor('#00ff00')
			.setFooter({ text: `ID: ${message.id}` });
		interaction.reply({ embeds: [editEmbed], components: [row], ephemeral: true });
	}
};
