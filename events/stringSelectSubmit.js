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
const { RoleManager } = require('../util/RoleManager');
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
		} else if (menuId === 'buttonSelectMenu') {
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

			const roleSelectEmbed = new EmbedBuilder()
				.setTitle(`Set roles: ${selection[0]}`)
				.setDescription('Select the roles to set for this button from the dropdown below')
				.setColor('#00ff00')
				.setFooter({ text: `ID: ${messageID}` });

			const row = new ActionRowBuilder();

			const menuBuilder = new RoleSelectMenuBuilder()
				.setCustomId('roleSelectMenu')
				.setPlaceholder('Select the roles to set for the button')
				.setMinValues(1)
				.setMaxValues(25);

			row.addComponents(menuBuilder);

			interaction.reply({ embeds: [roleSelectEmbed], components: [row], ephemeral: true });
		} else if (menuId.startsWith('roles.')) {
			await interaction.deferReply({ ephemeral: true });

			const client = interaction.client;
			const discordLogger = new DiscordLogger(client, logChannel);
			try {
				await discordLogger.init();
			} catch (error) {
				logger.warn(`Failed to initialize DiscordLogger`);
			}

			const roleManager = new RoleManager();
			try {
				await roleManager.init();
			} catch (error) {
				logger.error(`Failed to initialize RoleManager`);
				interaction.reply({
					content: 'Failed to get roles! Contact staff if the issue persists.',
					ephemeral: true
				});
				discordLogger.logMessage('An error occurred initializing RoleManager!').then(() => {
					discordLogger.logMessage(error);
				});
				return;
			}

			const buttonId = menuId.split('roles.')[1];
			roleManager
				.getRoles(interaction.message.reference.id, buttonId)
				.then(async (storedRoles) => {
					const member = interaction.member;
					const selfMember = interaction.guild.members.me;

					if (!selfMember.permissions.has('ManageRoles')) {
						discordLogger.logMessage('Cannot manage roles!');
						interaction.editReply(
							'Error: Missing Manage Roles permission, contact server administration'
						);
						return;
					}

					let addedRoles = '';
					let removedRoles = '';

					await storedRoles.forEach((roleId) => {
						if (selection.includes(roleId)) {
							if (!member.roles.cache.has(roleId)) {
								addedRoles += `<@&${roleId}>\n`;
								member.roles.add(roleId).catch((error) => {
									logger.error(error);
								});
							}
						} else {
							if (member.roles.cache.has(roleId)) {
								removedRoles += `<@&${roleId}>\n`;
								member.roles.remove(roleId).catch((error) => {
									logger.error(error);
								});
							}
						}
					});

					let embed = new EmbedBuilder()
						.setTitle('Roles changed!')
						.setTimestamp()
						.setThumbnail(
							'https://cdn.discordapp.com/emojis/1275216661577863239.webp?size=96&quality=lossless'
						);
					if (addedRoles != '') {
						embed = embed.addFields({
							name: 'Added Roles',
							value: addedRoles
						});
					}
					if (removedRoles != '') {
						embed = embed.addFields({
							name: 'Removed Roles',
							value: removedRoles
						});
					}

					interaction.editReply({ embeds: [embed] });
				})
				.catch((error) => {
					logger.error(error);
					interaction.reply({
						content: 'Failed to get roles! Contact staff if the issue persists.',
						ephemeral: true
					});
					discordLogger.logMessage('An error occurred getting roles!').then(() => {
						discordLogger.logMessage(error);
					});
				});
		}
	}
};
