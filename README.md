# Command Usage

## Embed Command

Command used to create and update embed messages with the bot

### /embed create

Used to create a new embed message

Options
  - content
    - The main body of the embed
    - Requried
  - title
    - The title of the embed
    - Not required, defaults to no title
  - color
    - The hexadecimal or RGB color code for the bar on the left of the embed
    - Not required, defaults to dark grey
  - channel
    - The channel to post the embed in
    - Not required, defaults to the current channel

Examples: 
  - `/embed create content:Select your roles here! title:Role Selector color:42be9a channel:#roles`
  - `/embed create content:Select some roles`

### /embed update

Used to update an existing embed message

Options
  - message
    - The message ID of the embed to update, must be one created with this bot
    - Required
  - content
    - The new main body of the embed
    - Requried
  - title
    - The new title of the embed
    - Not required, defaults to no title
  - color
    - The new hexadecimal or RGB color code for the bar on the left of the embed
    - Not required, defaults to dark grey
  - channel
    - The channel the existing embed is in
    - Not required, defaults to the current channel

Examples:
  - `/embed update message:1069342907129139291 content:New text title:New title`
  - `/embed update message:1069342907129139291 content:Other text in this embed color:231,90,63 channel:#roles`