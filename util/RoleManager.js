const log4js = require('log4js');
const logger = log4js.getLogger('RoleManager');
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
	 * Reads the data file
	 * @returns {Object} The JSON object of the data file
	 */
	async readDataFile() {
		const dataFile = path.join(__dirname, '..', 'data', 'roleData.json');
		const data = await fsPromises.readFile(dataFile);
		try {
			return JSON.parse(data);
		} catch (error) {
			logger.error(error);
			return null;
		}
	}

	/**
	 * Writes data to the file
	 * @param {Object} data The JSON object to write
	 */
	async writeDataFile(data) {
		const dataFile = path.join(__dirname, '..', 'data', 'roleData.json');
		await fsPromises
			.writeFile(dataFile, JSON.stringify(data))
			.then(() => {
				logger.trace('Wrote data file');
			})
			.catch((error) => {
				logger.error(error);
			});
	}

	/**
	 * Returns a list of roles associated with the message and button
	 * @param {String} message The message ID
	 * @param {String} button The button's custom ID
	 * @returns {String[]} The role IDs
	 */
	async getRoles(message, button) {
		logger.trace(`Getting roles for button ${button} on message ${message}`);
		const data = await this.readDataFile();
		logger.trace(`Got the data`);
		logger.debug(data);
		if (data === null) {
			throw new Error('The data was null');
		}
		const messageData = data[message];
		if (!messageData) {
			throw new Error('No data for message');
		}

		const buttonData = messageData[button];
		if (!buttonData) {
			throw new Error('No data for button');
		}
		logger.trace('Printing button data');
		logger.debug(buttonData);
		return buttonData;
	}

	/**
	 * Sets a list of roles to associate with a button on a message
	 * @param {String} message The message ID
	 * @param {String} button The button's custom ID
	 * @param {String[]} roles A list of role IDs
	 */
	async setRoles(message, button, roles) {
		logger.trace(`Setting roles ${roles} for button ${button} on message ${message}`);
		let data = await this.readDataFile();
		logger.trace(`Got the data`);
		logger.debug(data);

		if (data === null) {
			throw new Error('The data was null');
		}

		if (!data[message]) {
			data[message] = {};
		}

		data[message][button] = roles;

		this.writeDataFile(data)
			.then(() => {
				logger.debug('Successfully saved roles');
			})
			.catch((error) => {
				logger.error(error);
				throw new Error('Failed to write data file');
			});
	}

	async deleteButton(message, button) {
		let data = await this.readDataFile();

		if (data === null) {
			throw new Error('The data was null');
		}

		if (!data[message]) {
			throw new Error('No data for message');
		}

		if (!data[message][button]) {
			throw new Error('No data for button');
		}

		delete data[message][button];

		if (Object.keys(data[message]).length === 0) {
			delete data[message];
		}

		this.writeDataFile(data)
			.then(() => {
				logger.debug('Successfully deleted button');
			})
			.catch((error) => {
				logger.error(error);
				throw new Error('Failed to write data file');
			});
	}
}

module.exports = {
	RoleManager
};
