const { Events, EmbedBuilder } = require('discord.js');
const { Logger } = require('../util/Logger.js');
const { logChannelId } = require('../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;

		if (interaction.customId === 'roleModal') {
			await interaction.deferReply({ ephemeral: true });

			const roleEmbedTitle = interaction.fields.getTextInputValue('roleEmbedTitle');
			const roleEmbedBody = interaction.fields.getTextInputValue('roleEmbedBody');
			const roleEmbedColor = interaction.fields.getTextInputValue('roleEmbedColor');

			const roleEmbed = new EmbedBuilder().setTitle(roleEmbedTitle).setDescription(roleEmbedBody);

			if (roleEmbedColor !== 'None') {
				roleEmbed.setColor(roleEmbedColor);
			}

			const channel = interaction.channel;
			channel
				.send({ embeds: [roleEmbed] })
				.then(function () {
					interaction.editReply('Role embed has been sent!');
				})
				.catch(function (error) {
					interaction.editReply('Error: Role embed failed to send!');
					logger.logMessage(`Error sending role embed!\n\`\`\`\n${error}\n\`\`\``);
				});
		}
	}
};
