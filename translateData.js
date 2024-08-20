const log4js = require('log4js');
const logger = log4js.getLogger('translateData');
const { logLevel, channels } = require('./config.json');
logger.level = logLevel;

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('node:path');
const { RoleManager } = require('./util/RoleManager');

const dataFolder = path.join(__dirname, '.', 'data');
const dataFile = path.join(__dirname, '.', 'data', 'roleData.json');
let roleDataContent = {};
const files = fs.readdirSync(dataFolder);
files.forEach((fileName) => {
	if (fileName.endsWith('.yml')) {
		const content = fs.readFileSync(path.join(__dirname, '.', 'data', fileName));
		const messageData = yaml.load(content)['messages'];
		if (messageData === undefined) {
			return;
		}
		Object.entries(messageData).forEach((message) => {
			const [messageId, buttons] = message;
			Object.entries(buttons).forEach((button) => {
				const [buttonId, roles] = button;
				const roleData = roles['roles'];
				logger.debug(buttonId);
				let buttonData = roleData;
				logger.debug(buttonData);
				let newMessageData = {};
				newMessageData[buttonId] = buttonData;
				logger.debug(newMessageData);
				if (!roleDataContent[messageId]) {
					roleDataContent[messageId] = {};
				}
				roleDataContent[messageId][buttonId] = roleData;
				// logger.debug(roleDataContent);
			});
		});
	}
});

fs.writeFileSync(dataFile, JSON.stringify(roleDataContent));
