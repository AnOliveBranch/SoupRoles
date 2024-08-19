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

		if (interaction.customId === 'roleModal') {
			const roleEmbedTitle = interaction.fields.getTextInputValue('roleEmbedTitle');
			const roleEmbedBody = interaction.fields.getTextInputValue('roleEmbedBody');
			const roleEmbedColor = interaction.fields.getTextInputValue('roleEmbedColor');

			const roleEmbed = new EmbedBuilder().setTitle(roleEmbedTitle).setDescription(roleEmbedBody);

			if (roleEmbedColor.toLowerCase() !== 'none') {
				try {
					roleEmbed.setColor(roleEmbedColor);
				} catch (error) {
					if (error.code === 'ColorConvert') {
						await interaction.editReply(`Could not convert \`${roleEmbedColor}\` to a color!`);
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
				.send({ embeds: [roleEmbed] })
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
		} else if (interaction.customId === 'buttonModal') {
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
					message.edit({ components: components });
					interaction.editReply('Added the button to the message');
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
