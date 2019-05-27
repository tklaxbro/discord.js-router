const discord = require('../../index.js');

discord.on('cmd', (cmd, args, data) => {
  if (cmd == "test") {
    data.channel.send("This works");
  }
});
