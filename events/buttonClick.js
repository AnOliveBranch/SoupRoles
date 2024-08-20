const log4js = require('log4js');
const logger = log4js.getLogger('ButtonClickEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');
const { RoleManager } = require('../util/RoleManager');
const { buildMenuComponents } = require('../util/utils');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

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
			return;
		}

		const messageId = interaction.message.id;
		const buttonId = interaction.customId;

		interaction.guild.roles
			.fetch()
			.then((guildRoles) => {
				roleManager
					.getRoles(messageId, buttonId)
					.then((roleIds) => {
						let roles = [];
						guildRoles.forEach((guildRole) => {
							if (roleIds.includes(guildRole.id)) {
								roles.push(guildRole);
							}
						});

						const component = buildMenuComponents(roles, interaction.member.roles.cache, buttonId);
						interaction.reply({ components: [component], ephemeral: true });
					})
					.catch((error) => {
						if (error == 'Error: No data for message' || error == 'Error: No data for button') {
							interaction.reply({
								content:
									'No roles are assigned to this button yet! Contact staff to have them set it up',
								ephemeral: true
							});
							return;
						}
						logger.error(error);
						interaction.reply({
							content: 'Failed to get roles! Contact staff if the issue persists.',
							ephemeral: true
						});
						discordLogger.logMessage('An error occurred getting roles!').then(() => {
							discordLogger.logMessage(error);
						});
					});
			})
			.catch((error) => {
				logger.error(error);
				interaction.reply({
					content: 'Failed to get roles! Contact staff if the issue persists.',
					ephemeral: true
				});
				discordLogger.logMessage('An error occurred getting guild roles!').then(() => {
					discordLogger.logMessage(error);
				});
			});
	}
};
