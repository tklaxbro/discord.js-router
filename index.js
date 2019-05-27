#!/bin/env node

const util = require('util');
const path = require('path');
const events = require('eventemitter2');
const EventEmitter = events.EventEmitter2;
const Validator = require('jsonschema').Validator;
const v = new Validator();
const djs = require('discord.js');
const requireAll = require('require-all');
const fs = require('fs');

const optionsSchema = {
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
    reactions: {
      type: "boolean"
    },
    guilds: {
      type: "boolean"
    },
    members: {
      type: "boolean"
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
  required: ["plugins_dir", "owners", "trigger"]
};

let instance;
class Discord extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  };

  Start(options) {
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
    instance.ReloadPlugins().then(() => {
      instance.BotHandler();
      instance.ChatHandler();
      if (instance.options.reactions) instance.monitorReactions();
      if (instance.options.members) instance.monitorMembers();
      if (instance.options.guilds) instance.monitorGuilds();
      instance.Login();
    });
  };

  BotHandler() {
    instance.bot.on('ready', instance.EmitEvent);
    instance.bot.on('disconnected', () => {
      instance.emit('disconnected');
      instance.Login();
    });
  };

  ChatHandler() {
    instance.bot.on('message', message => {
      if (message.author.id == instance.bot.user.id) return;
      if (message.author.bot) return;
      if (message.content.length < instance.options.trigger.length) return;
      if (!message.content.startsWith(instance.options.trigger)) return;
      let args = message.content.split(/ +/);
      let cmd = args[0].slice(instance.options.trigger.length).toLowerCase();
      instance.emit('cmd', cmd, args, message);
    });
  };

  EmitEvent(...input) {
    let args = [this.event];
    args = args.concat(input);
    instance.emit.apply(instance, args);
  };

  monitorReactions() {
    instance.bot.on('messageReactionAdd', instance.EmitEvent);
    instance.bot.on('messageReactionRemove', instance.EmitEvent);
  };

  monitorMembers() {
    instance.bot.on('guildMemberRemove', instance.EmitEvent);
    instance.bot.on('guildMemberAdd', instance.EmitEvent);
  };

  monitorGuilds() {
    instance.bot.on('guildCreate', instance.EmitEvent);
    instance.bot.on('guildDelete', instance.EmitEvent);
  };

  setActivity(title, type) {
    instance.bot.user.setActivity(title, type).catch(err => {
      console.log(err);
    });
  };

  Restart() {
    if (instance.bot.status == 0) {
      instance.bot.destroy().then(() => {
        instance.Login();
      });
    } else {
      instance.Login();
    }
  };

  ReloadPlugins() {
    return new Promise((res, rej) => {
      fs.access(path.join(require.main.paths[0], "..", instance.options.plugins_dir), err => {
        if (err && err.code === 'ENOENT') {
          return console.log(new Error(`Folder ${require.main.paths[0]}/${instance.options.plugins_dir} does not exist. Please Create it.`));
        } else {
          instance.plugins = requireAll({
            dirname: path.join(require.main.paths[0], "..", instance.options.plugins_dir)
          });
          res();
        }
      });
    });
  };

  Login() {
    if ('SHARD_ID' in process.env) {
      instance.bot.login();
    } else {
      instance.bot.login(instance.options.token);
    }
  };
};

module.exports = (() => {
  return instance || (instance = new Discord());
})();
