const log4js = require('log4js');
const logger = log4js.getLogger('MessageContextMenuEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger.js');
const logChannel = channels['logChannelId'];

const { Events, EmbedBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const { getComponents, buildActionRows } = require('../util/utils');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;

		await interaction.deferReply({ ephemeral: true });

		const client = interaction.client;
		const discordLogger = new DiscordLogger(client, logChannel);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.warn(`Failed to initialize DiscordLogger`);
		}

		if (interaction.customId === 'embedCreateModal') {
			const embedTitle = interaction.fields.getTextInputValue('embedTitle');
			const embedBody = interaction.fields.getTextInputValue('embedBody');
			const embedColor = interaction.fields.getTextInputValue('embedColor');

			const embedMessage = new EmbedBuilder().setTitle(embedTitle).setDescription(embedBody);

			if (embedColor.toLowerCase() !== 'none') {
				try {
					embedMessage.setColor(embedColor);
				} catch (error) {
					if (error.code === 'ColorConvert') {
						await interaction.editReply(`Could not convert \`${embedColor}\` to a color!`);
					} else {
						logger.error(error);
						await interaction.editReply('An unknown error occurred setting the role color!');
						discordLogger.logMessage(`Error setting role color!\n\`\`\`\n${error}\n\`\`\``);
					}
					return;
				}
			}

			const channel = interaction.channel;
			channel
				.send({ embeds: [embedMessage] })
				.then(async function () {
					await interaction.editReply('Role embed has been sent!');
				})
				.catch(async function (error) {
					if (error.code === 50001) {
						await interaction.editReply(`No permission to view this channel!`);
					} else if (error.code === 50013) {
						await interaction.editReply(`No permission to send messages in this channel!`);
					} else {
						logger.error(error);

						await interaction.editReply('Error: Role embed failed to send!');
						discordLogger.logMessage(`Error sending role embed!\n\`\`\`\n${error}\n\`\`\``);
					}
				});
		} else if (interaction.customId === 'embedEditModal') {
			const embedTitle = interaction.fields.getTextInputValue('embedTitle');
			const embedBody = interaction.fields.getTextInputValue('embedBody');
			const embedColor = interaction.fields.getTextInputValue('embedColor');
			const messageId = interaction.fields.getTextInputValue('messageId');

			interaction.channel.messages
				.fetch(messageId)
				.then((message) => {
					const embedMessage = new EmbedBuilder().setTitle(embedTitle).setDescription(embedBody);

					if (embedColor.toLowerCase() !== 'none') {
						try {
							embedMessage.setColor(embedColor);
						} catch (error) {
							if (error.code === 'ColorConvert') {
								interaction.editReply(`Could not convert \`${embedColor}\` to a color!`);
							} else {
								logger.error(error);
								interaction.editReply('An unknown error occurred setting the role color!');
								discordLogger.logMessage(`Error setting role color!\n\`\`\`\n${error}\n\`\`\``);
							}
							return;
						}
					}

					message
						.edit({ embeds: [embedMessage] })
						.then(() => {
							interaction.editReply('Embed has been edited!');
						})
						.catch((error) => {
							logger.error(error);
							interaction.editReply('Error: Role embed failed to send!');
							discordLogger.logMessage(`Error sending role embed!\n\`\`\`\n${error}\n\`\`\``);
						});
				})
				.catch((error) => {
					logger.error(error);
					interaction.editReply(
						`Failed to fetch message with ID ${messageId}. Contact staff if the issue persists.`
					);
					discordLogger
						.logMessage(
							`Failed to fetch message with ID ${messageId} in channel ${interaction.channeId}`
						)
						.then(() => {
							discordLogger.logMessage(error);
						});
				});
		} else if (interaction.customId === 'buttonCreateModal') {
			const buttonTitle = interaction.fields.getTextInputValue('buttonTitle');
			const buttonId = interaction.fields.getTextInputValue('buttonId');
			const messageId = interaction.fields.getTextInputValue('messageId');

			const button = new ButtonBuilder()
				.setCustomId(buttonId)
				.setLabel(buttonTitle)
				.setStyle(ButtonStyle.Primary);

			interaction.channel.messages
				.fetch(messageId)
				.then((message) => {
					let messageButtons = getComponents(message);
					messageButtons.push(button);
					const components = buildActionRows(messageButtons);
					message
						.edit({ components: components })
						.then(() => {
							interaction.editReply('Added the button to the message');
						})
						.catch((error) => {
							logger.error(error);
							interaction.editReply('Failed to add button. Contact staff if the issue persists.');
							discordLogger.logMessage(`Failed to add a button`).then(() => {
								discordLogger.logMessage(error);
							});
						});
				})
				.catch((error) => {
					logger.error(error);
					interaction.editReply(
						`Failed to fetch message with ID ${messageId}. Contact staff if the issue persists.`
					);
					discordLogger
						.logMessage(
							`Failed to fetch message with ID ${messageId} in channel ${interaction.channeId}`
						)
						.then(() => {
							discordLogger.logMessage(error);
						});
				});
		} else if (interaction.customId === 'buttonEditModal') {
			const buttonTitle = interaction.fields.getTextInputValue('buttonTitle');
			const buttonId = interaction.fields.getTextInputValue('buttonId');
			const messageId = interaction.fields.getTextInputValue('messageId');

			const button = new ButtonBuilder()
				.setCustomId(buttonId)
				.setLabel(buttonTitle)
				.setStyle(ButtonStyle.Primary);

			interaction.channel.messages
				.fetch(messageId)
				.then((message) => {
					let messageButtons = getComponents(message);
					const index = messageButtons.findIndex((x) => x.data.custom_id === buttonId);
					messageButtons[index] = button;
					const components = buildActionRows(messageButtons);
					message
						.edit({ components: components })
						.then(() => {
							interaction.editReply('Successfully edited the button title');
						})
						.catch((error) => {
							logger.error(error);
							interaction.editReply(
								'Failed to edit button title. Contact staff if the issue persists.'
							);
							discordLogger.logMessage(`Failed to edit a button title`).then(() => {
								discordLogger.logMessage(error);
							});
						});
				})
				.catch((error) => {
					logger.error(error);
					interaction.editReply(
						`Failed to fetch message with ID ${messageId}. Contact staff if the issue persists.`
					);
					discordLogger
						.logMessage(
							`Failed to fetch message with ID ${messageId} in channel ${interaction.channeId}`
						)
						.then(() => {
							discordLogger.logMessage(error);
						});
				});
		}
	}
};
