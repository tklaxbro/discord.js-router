let options = {
  plugins_dir: "plugins",
  token: null, // Replace with String for the Discord Token.
  trigger: "dev!",
  owners: ["165372475562000385"]
};

let discord = require('../index.js');

discord.Start(options);

process.on('uncaughtException', err => {
	console.log(`uncaughtException: ${err}`);
});
process.on('unhandledRejection', err => {
  console.log(`unhandledRejection: ${err}`)
});
