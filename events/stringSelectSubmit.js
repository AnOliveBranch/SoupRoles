const log4js = require('log4js');
const logger = log4js.getLogger('StringSelectEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger.js');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');
const { getComponents, buildActionRows } = require('../util/utils');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;

		await interaction.deferReply({ ephemeral: true });

		const client = interaction.client;
		const discordLogger = new DiscordLogger(client, logChannel);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.warn(`Failed to initialize DiscordLogger`);
		}

		const menuId = interaction.customId;
		const selection = interaction.values;

		if (menuId === 'buttonDeleteMenu') {
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

			interaction.channel
				.fetch(messageID)
				.then((message) => {
					logger.debug(message);

					const buttons = getComponents(message);
					let newList = [];
					buttons.forEach((button) => {
						if (!selection.includes(button.data.custom_id)) {
							newList.push(button);
						}
					});
					const components = buildActionRows(newList);
					message.edit({ components: components });
					interaction.editReply('Deleted the button(s) from the message');
				})
				.catch((error) => {
					interaction.editReply('Failed to fetch message!');
					logger.error(error);
					discordLogger.logMessage('Failed to fetch message for delete button!').then(() => {
						discordLogger.logMessage(error);
					});
				});
		}
	}
};
