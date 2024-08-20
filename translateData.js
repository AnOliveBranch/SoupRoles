const log4js = require('log4js');
const logger = log4js.getLogger('translateData');
const { logLevel, channels } = require('./config.json');
logger.level = logLevel;

const yaml = require('js-yaml');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const { RoleManager } = require('./util/RoleManager');

const roleManager = new RoleManager();
roleManager
	.init()
	.then(() => {
		const dataFolder = path.join(__dirname, '.', 'data');
		fsPromises
			.readdir(dataFolder)
			.then((dataFiles) => {
				dataFiles.forEach((fileName) => {
					if (fileName.endsWith('.yml')) {
						fsPromises
							.readFile(path.join(__dirname, '.', 'data', fileName))
							.then((content) => {
								const messageData = yaml.load(content)['messages'];
								if (messageData === undefined) {
									return;
								}
								Object.entries(messageData).forEach((message) => {
									const [messageId, buttons] = message;
									Object.entries(buttons).forEach((button) => {
										const [buttonId, roles] = button;
										roleManager
											.setRoles(messageId, buttonId, roles['roles'])
											.then(() => {
												logger.info(
													`Successfully set roles for button ${buttonId} on message ${messageId}`
												);
											})
											.catch((error) => {
												logger.warn(
													`Failed to set roles for button ${buttonId} on message ${messageId}`
												);
												logger.error(error);
											});
									});
								});
							})
							.catch((error) => {
								logger.error(`Failed to read data file ${fileName}`);
								logger.error(error);
							});
					}
				});
			})
			.catch((error) => {
				logger.error('Failed to read data folder');
				logger.fatal(error);
			});
	})
	.catch((error) => {
		logger.error('Failed to initialize Role Manager');
		logger.fatal(error);
	});
