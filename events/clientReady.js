const log4js = require('log4js');
const logger = log4js.getLogger('ReadyEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const { DiscordLogger } = require('../util/DiscordLogger');
const logChannel = channels['logChannelId'];

const { Events } = require('discord.js');
const { RoleManager } = require('../util/RoleManager');
const { exit } = require('process');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const roleManager = new RoleManager();
		try {
			await roleManager.init();
		} catch (error) {
			logger.fatal(`Failed to initialize RoleManager`);
			exit();
		}

		const discordLogger = new DiscordLogger(client, logChannel);
		try {
			await discordLogger.init();
		} catch (error) {
			logger.warn(`Failed to initialize DiscordLogger`);
		}

		discordLogger.logMessage('Bot is ready');
		logger.info(`Ready! Logged in as ${client.user.tag}`);
	}
};
