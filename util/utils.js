const {
	Message,
	Component,
	ButtonComponent,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonStyle,
	ButtonBuilder
} = require('discord.js');

/**
 * Gets a list of components on a message
 * @param {Message} message
 * @returns {Component[]}
 */
function getComponents(message) {
	let componentList = [];
	message.components.forEach((componentRow) => {
		componentRow.components.forEach((component) => {
			componentList.push(component);
		});
	});
	return componentList;
}

/**
 * Builds action rows from a list of buttons
 * @param  {...ButtonComponent} buttons
 * @returns {ActionRowBuilder[]} An array of built action rows
 */
function buildActionRows(...buttons) {
	if (buttons.length > 25) {
		throw new Error('Too many buttons!');
	}

	let rows = [];
	for (let i = 0; i < buttons.length; i++) {
		let row;
		if (i % 5 === 0) {
			row = new ActionRowBuilder();
		} else {
			row = rows[rows.length - 1];
		}
		row.addComponents(buttons[i]);
		rows[i / 5] = row;
	}
	return rows;
}

function buildMenuComponents(roles, memberRoles, buttonId) {
	const row = new ActionRowBuilder();
	const menuBuilder = new StringSelectMenuBuilder()
		.setCustomId(`roles.${buttonId}`)
		.setPlaceholder('Select role(s)')
		.setMaxValues(roles.length)
		.setMinValues(0);

	roles.forEach((role) => {
		if (memberRoles.has(role.id)) {
			menuBuilder.addOptions({
				label: role.name,
				value: role.id,
				default: true
			});
		} else {
			menuBuilder.addOptions({
				label: role.name,
				value: role.id
			});
		}
	});

	row.addComponents(menuBuilder);
	return row;
}

module.exports = {
	getComponents,
	buildActionRows,
	buildMenuComponents
};
