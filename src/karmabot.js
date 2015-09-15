'use strict';

// Dependencies
var _ = require('lodash');
var mongoose = require('mongoose');
var Slack = require('slack-client');
var Q = require('q');

// Internal
var Commands = require("./commands");

var Karmabot = function() {
	var _this = this;
}

Karmabot.prototype.initialize = function(config, configPath) {
	if (!config.slack_token) {
		return console.error("No slack_token specified in options.");
	}

	this.config = config;
	this.mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || config.database || "mongodb://localhost/karmabot";
	this.slack_token = config.slack_token;
	this.slack_group = config.slack_group;

	this._nextUserDMHandlers = []

	// Setup Commands
	this.commands = new Commands(this);

	// Connect to DB
	mongoose.connect(this.mongoUri);

	// Connect to Slack, setup listeners
	this.slack = new Slack(this.slack_token, true, true);
	this.startListeners();
}

Karmabot.prototype.startListeners = function() {
	var _this = this;

	this.slack.on("open", function() {
		_this.handleOpen();
	});

	this.slack.on("message", function(message) {
		_this.handleMessage(message);
	});

	this.slack.on("close", function() {
		_this.slack.reconnect();
	});

	this.slack.login();
}

Karmabot.prototype.handleOpen = function() {
	var _this = this;

	// Any logic to handle when first connecting to slack
}

Karmabot.prototype.getChannel = function(slack_channel) {
	var _this = this;
	var is_member_channels = [];
	var channel = null;

	Object.keys(this.slack.channels).forEach(function(key) {
		if (_this.slack.channels[key].is_member == true) {
			is_member_channels.push(_this.slack.channels[key]);

			if (_this.slack.channels[key].name == slack_channel) {
				channel = _this.slack.channels[key];
			}
		}
	});

	return channel;
}

Karmabot.prototype.getGroup = function(slack_group) {
	var _this = this;
	var is_member_groups = [];
	var group = null;

	Object.keys(this.slack.groups).forEach(function(key) {
		if (_this.slack.groups[key].name == slack_group) {
			group = _this.slack.groups[key];
		}
	});

	return group;
}

Karmabot.prototype.handleMessage = function(message) {
	// Any logic to handle when a message comes in
	var _this = this;

	var dmChannel = this.slack.getChannelGroupOrDMByID(message.channel);
	var user = this.slack.getUserByID(message.user);

	if (dmChannel && message.text) {
		if (dmChannel.is_im) {
			this.routeMessage(dmChannel, user, message.text, true);
		} else {
			this.routeMEssage(dmChannel, user, message.text);
		}
	}
}

Karmabot.prototype.routeMessage = function(dmChannel, user, message, is_dm) {
	// Checks if there's a handler for this user
	// If there's no current handler, pass it off to the right command handler

	var handler = this.checkUserHandlerExists(user, true);

	if (handler) {
		handler(dmChannel, user, message);
	} else {
		var triggerWord = message.split(" ")[0].toLowerCase();

		if (this.commands[triggerWord]) {
			this.commands[triggerWord](dmChannel, user, message);
		} else {
			this.commands.default(dmChannel, user, message);
		}
	}
}

Karmabot.prototype.setNextUserDMHandler = function(user, cb) {
	// Provides a callback on the next user's DM
	// for simple context aware applications

	var handler = {
		id: user.id,
		cb: cb
	}

	this._nextUserDMHandlers.push(handler);
}

Karmabot.prototype.checkUserHandlerExists = function(user, removeOnFind) {
	// Checks if there's already a nextUserDMHandler for a user
	// Removes the handler if removeOnFind is true

	var found = false;

	for (var i = 0; i < this._nextUserDMHandlers.length; i++) {
		if (this._nextUserDMHandlers[i].id == user.id) {
			found = this._nextUserDMHandlers[i].cb;

			if (removeOnFind) {
				this._nextUserDMHandlers.splice(this._nextUserDMHandlers.indexOf(found), 1);
			}

			break;
		}
	}

	return found;
}

Karmabot.prototype.getUsers = function(channel) {
	// Returns array of members of a channel

	var _this = this;

	var members = channel.members.map(function(user_id) {
		return _this.slack.getUserByID(user_id);
	});

	return members;
}

// -------------
// Cron
// -------------

Karmabot.prototype.startCron = function() {
	var _this = this;
//	var blockingTickets = schedule.scheduleJob('0 8,12,16,20,24 0 0 0', function() {
//		_this.modules.github.sendBlockingIssues(_this.channel);
//	});
}

Karmabot.prototype.shutdown = function() {
	this.slack.disconnect();
}

module.exports = Karmabot;
