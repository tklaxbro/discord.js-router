#!/bin/env node

var util = require('util');
var path = require('path');
var events = require('events');
var EventEmitter = events.EventEmitter;
var Validator = require('jsonschema').Validator;
var v = new Validator();
var djs = require('discord.js');
var requireAll = require('require-all');
var fs = require('fs');

var optionsSchema = {
  id: "/optionsSchema",
  type: "object",
  properties: {
    plugins_dir: {
      type: "string"
    },
    token: {
      type: "string"
    },
    trigger: {
      type: "string"
    },
    owners: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: {
        type: "string",
        pattern: /[0-9]{17,19}/,
      }
    }
  },
  required: ["plugins_dir", "owners"]
};

var instance;

function Discord() {
  if(arguments.callee._singletonInstance) {
    return arguments.callee._singletonInstance;
  }
  arguments.callee._singletonInstance = this;
  EventEmitter.call(this);
  this.setMaxListeners(100);
}

Discord.prototype.Start = function(options) {
    if (options) instance.options = options;
    if ('SHARD_ID' in process.env) {
      instance.bot = new djs.Client();
    } else {
      optionsSchema.required.push(("token"));
      let chk = v.validate(options, optionsSchema);
      if (chk.errors.length > 0) {
        return console.log(new Error(util.inspect(chk.errors, false, null, true)));
      }
      instance.bot = new djs.Client({
        respawn: true
      });
    }
    fs.access(path.join(require.main.paths[0], "..", instance.options.plugins_dir), function(err) {
      if (err && err.code === 'ENOENT') {
        return console.log(new Error(`Folder ${require.main.paths[0]}/${instance.options.plugins_dir} does not exist. Please Create it.`));
      } else {
        instance.ReloadPlugins();

        instance.bot.on('ready', function() {
          instance.emit('ready')
        });
        instance.bot.on('message', function(message) {
          if (message.author.id == instance.bot.user.id) return;
          if (message.author.bot) return;
          if (message.content.length < instance.options.trigger.length) return;
          if (!message.content.startsWith(instance.options.trigger)) return;
          var args = message.content.split(/ +/);
          let cmd = args[0].slice(instance.options.trigger.length).toLowerCase();
          instance.emit('cmd', cmd, args, message);
        });
        instance.bot.on('disconnected', function() {
          instance.emit('disconnected');
          instance.Login();
        });
        instance.bot.on('messageReactionAdd', function(reaction, user) {
        	instance.emit('msgReactionAdd', reaction, user);
        });

        instance.bot.on('messageReactionRemove', function(reaction, user) {
        	instance.emit('msgReactionRemove', reaction, user);
        });

        instance.bot.on('guildMemberRemove', function(member) {
        	instance.emit('userPart', member);
        });

        instance.bot.on('guildMemberAdd', function(member) {
        	instance.emit('userJoin', member);
        });

        instance.bot.on('guildCreate', function(guild) {
        	instance.emit('guildJoined', guild);
        });

        instance.bot.on('guildDelete', function(guild) {
        	instance.emit('guildParted', guild);
        });
        instance.Login();
      }
    });


};

Discord.prototype.setActivity = function(title, type) {
  instance.bot.user.setActivity(title, type).catch(function(err) {
    console.log(err);
  });
};

Discord.prototype.Restart = function() {
  if (instance.bot.status == 0) {
    instance.bot.destroy().then(() => {
      instance.Login();
    });
  } else {
    instance.Login();
  }
};

Discord.prototype.ReloadPlugins = function() {
  instance.plugins = requireAll({
    dirname: path.join(require.main.paths[0], "..", instance.options.plugins_dir)
  });
};
Discord.prototype.Login = function() {
  if ('SHARD_ID' in process.env) {
    instance.bot.login();
  } else {
    instance.bot.login(instance.options.token);
  }
}

util.inherits(Discord, EventEmitter);



module.exports = function() {
  return instance || (instance = new Discord());
}();
