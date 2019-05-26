var discord = require('../../index.js');

discord.on('cmd', function(cmd, args, data) {
  if (cmd == "test") {
    data.channel.send("This works");
  }
});
