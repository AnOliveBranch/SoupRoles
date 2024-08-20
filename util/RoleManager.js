const log4js = require('log4js');
const logger = log4js.getLogger('StringSelectEvent');
const { logLevel, channels } = require('../config.json');
logger.level = logLevel;

const fsPromises = require('node:fs/promises');
const path = require('node:path');

class RoleManager {
	constructor() {
		this._status = null;
	}

	/**
	 *
	 * @returns {String} The status
	 */
	getStatus() {
		return this._status;
	}

	/**
	 * Initializes the RoleManager
	 */
	async init() {
		this.createDataFolder()
			.then(() => {
				this.createDataFile()
					.then(() => {
						this._status = 'init';
					})
					.catch(() => {
						this._status = 'failed';
					});
			})
			.catch(() => {
				this._status = 'failed';
			});
	}

	async createDataFolder() {
		const dataFolder = path.join(__dirname, '..', 'data');
		return fsPromises.access(dataFolder).catch(() => {
			logger.info('Could not find data folder, creating it');
			fsPromises.mkdir(dataFolder).catch((error) => {
				logger.error('Failed to create data folder');
				logger.error(error);
			});
		});
	}

	async createDataFile() {
		const dataFile = path.join(__dirname, '..', 'data', 'roleData.json');
		return fsPromises.access(dataFile).catch(() => {
			logger.info('Could not find data file, creating it');
			fsPromises.writeFile(dataFile, '{}').catch((error) => {
				logger.error('Failed to create data file');
				logger.error(error);
			});
		});
	}

	/**
	 * Returns a list of roles associated with the message and button
	 * @param {String} message The message ID
	 * @param {String} button The button's custom ID
	 * @returns {String[]} The role IDs
	 */
	async getRoles(message, button) {
		return [
			'1069320267962269726',
			'1069320239524884571',
			'1069320287725822013',
			'1069320308600864788'
		];
	}

	/**
	 * Sets a list of roles to associate with a button on a message
	 * @param {String} message The message ID
	 * @param {*} button The button's custom ID
	 * @param {*} roles A list of role IDs
	 */
	async setRoles(message, button, roles) {}

	async deleteButton(message, button) {}

	async deleteMessage(message) {}
}

module.exports = {
	RoleManager
};
