var Commands = function(Karmabot) {
	this.Karmabot = Karmabot;
}

Commands.prototype.default = function(channel, user, message, is_dm) {
	channel.send("Command not recognized, sorry! Maybe you meant to mention someone first followed by your message? No quotes needed!");
}

Commands.prototype.handleMention = function(from_channel, to_channel, from_user, to_user, message, is_dm) {
	if (message == "+1") {
		this.karma(from_channel, to_channel, from_user, to_user, message, is_dm);
	} else {
		this.compliment(from_channel, to_channel, from_user, to_user, message, is_dm);
	}
}

Commands.prototype.compliment = function(from_channel, to_channel, from_user, to_user, message, is_dm) {
	if (!is_dm) {
		return false;
	}

	from_channel.send("Compliment sent! :heart:");

	var formatted_message = "Surprise compliment! Someone said: " + message;
//	var reply_message = "You can reply to your anonmyous complimenter with a single message right after this one. :)"
	var reply_message = "Want to anonymously compliment someone else? Just DM me with a name and your message!"
	to_channel.send(formatted_message);
	to_channel.send(reply_message);
}

Commands.prototype.complimentReply = function(channel, user, message) {
}

Commands.prototype.karma = function(from_channel, to_channel, from_user, to_user, message, is_dm) {
	from_channel.send("Message sent!");
	to_channel.send("You just got karma'd!");
}

module.exports = Commands;
