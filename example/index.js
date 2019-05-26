
var options = {
  plugins_dir: "plugins",
  token: null, // Replace with String for the Discord Token.
  trigger: "dev!",
  owners: ["165372475562000385"]
};

var discord = require('../index.js');

discord.Start(options);

process.on('uncaughtException', function(err) {
	console.log(`uncaughtException: ${err}`);
});
process.on('unhandledRejection', function(err) {
  console.log(`unhandledRejection: ${err}`)
});
