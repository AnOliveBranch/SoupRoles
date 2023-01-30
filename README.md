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

## Button Command

Command for managing buttons on an embed message

### /button create

Used to create a new button on a message

Options
  - message
    - The message ID of the message to place a button on, must be one created with this bot
    - Required
  - id
    - The custom ID of the button you are creating
    - Required
  - title
    - The text that will be displayed in the button
    - Required
  - channel
    - The channel of the message to place a button on
    - Not required, defaults to the current channel

Examples:
  - `/button create message:1069342907129139291 id:pronounButton title:Pronouns`
  - `/button create message:1069342907129139291 id:this can have spaces title:Button Text channel:#roles`

### /button delete

Used to delete a button on a message

Options
  - message
    - The message ID of the message to delete the button from
    - Required
  - id
    - The custom ID of the button you are deleting
    - Required
  - channel
    - The channel of the message to delete the button from
    - Not required, defaults to the current channel

Example:
  - `/button delete message:1069342907129139291 id:pronounButton`

### /button update

Used to update the text on a button

Options
  - message
    - The message ID of the message the button is on
    - Required
  - id
    - The custom ID of the button you are editing
    - Required
  - newtitle
    - The updated text that will be displayed in the button
    - Required
  - channel
    - The channel of the message the button is on
    - Not required, defaults to the current channel

Example:
  - `/button update message:1069342907129139291 id:pronounButton newtitle:Pick Pronouns`

### /button get

Used to get a list of buttons on a message. Useful for finding button IDs

Options
  - message
    - The message ID of the message to get buttons for
    - Required
  - channel
    - The channel of the message to get buttons for
    - Not required, defaults to the current channel

Example:
  - `/button get message:1069342907129139291`