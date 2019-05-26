# discord.js-router

![Build Status](https://img.shields.io/travis/Bioblaze/discord.js-router.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![Downloads](https://img.shields.io/npm/dm/discord.js-router.svg)
![Downloads](https://img.shields.io/npm/dt/discord.js-router.svg)
![npm version](https://img.shields.io/npm/v/discord.js-router.svg)
![License](https://img.shields.io/npm/l/discord.js-router.svg)

![dependencies](https://img.shields.io/david/Bioblaze/discord.js-router.svg)
![dev dependencies](https://img.shields.io/david/dev/Bioblaze/discord.js-router.svg)

[![Code Climate](https://codeclimate.com/github/Bioblaze/discord.js-router/badges/gpa.svg)](https://codeclimate.com/github/Bioblaze/discord.js-router)
[![Discord Chat](https://img.shields.io/discord/165374225320771586.svg)](https://discord.gg/T8uVhzU)
[![PayPal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://paypal.me/BioblazePayne)  

Discord is a trademark or registered trademark of Hammer & Chisel, Inc. in the U.S. and/or other countries. "discord.js-router" is not operated by, sponsored by, or affiliated with Hammer & Chisel Inc. in any way.

## Install
```bash
$ npm install discord.js-router
```

## Usage of the Discord.js Router

### Configure

#### Config Options

##### Base
```javascript
{
  plugins_dir: String, // Required
  token: String, //Required unless you Launch it as a Shard of Discord.js
  trigger: String, //Required
  reactions: Boolean, // Optional
  guilds: Boolean, // Optional
  members: Boolean, // Optional
  owners: Array of String // Required
}
```

##### Example
```javascript

var discord = require('discord.js-router');

discord.Start({
  plugins_dir: "plugins", // This Directory must Exist
  token: "YourBotTokenGoesHere", // Replace with String for the Discord Token.
  trigger: "dev!",
  owners: ["165372475562000385"]
});

```

## Issue

If any Issues Please Submit them on the Github!

## Example

### /index.js
```javascript

var options = {
  plugins_dir: "plugins",
  token: null, // Replace with String for the Discord Token.
  trigger: "dev!",
  owners: ["165372475562000385"]
};

var discord = require('discord.js-router');

discord.Start(options);

process.on('uncaughtException', function(err) {
	console.log(`uncaughtException: ${err}`);
});
process.on('unhandledRejection', function(err) {
  console.log(`unhandledRejection: ${err}`)
});

```

### /plugins/test.js

```javascript

var discord = require('discord.js-router');

discord.on('cmd', function(cmd, args, data) {
  if (cmd == "test") {
    data.channel.send("This works");
  } else if (cmd == "reload") {
    discord.ReloadPlugins();
    data.channel.send("Plugins are Reloaded!");
  }
});

```
