const log4js = require('log4js');
const logger = log4js.getLogger('translateData');
const { logLevel, channels } = require('./config.json');
logger.level = logLevel;

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('node:path');

const dataFolder = path.join(__dirname, '.', 'data');
const dataFile = path.join(__dirname, '.', 'data', 'roleData.json');
let roleDataContent = {};
const files = fs.readdirSync(dataFolder);
files.forEach((fileName) => {
	if (fileName.endsWith('.yml')) {
		const filePath = path.join(__dirname, '.', 'data', fileName);
		const content = fs.readFileSync(filePath);
		const messageData = yaml.load(content)['messages'];
		if (messageData === undefined) {
			fs.rmSync(filePath);
			return;
		}
		Object.entries(messageData).forEach((message) => {
			const [messageId, buttons] = message;
			Object.entries(buttons).forEach((button) => {
				const [buttonId, roles] = button;
				const roleData = roles['roles'];
				logger.debug(messageId);
				logger.debug(buttonId);
				logger.debug(roles);
				if (!roleDataContent[messageId]) {
					roleDataContent[messageId] = {};
				}
				roleDataContent[messageId][buttonId] = roleData;
			});
		});
		fs.rmSync(filePath);
	}
});

fs.writeFileSync(dataFile, JSON.stringify(roleDataContent));
