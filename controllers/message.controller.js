const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const Socket = require("../socket/socket")
const User = require("../models/base-user.model");

// const sendMessage = async (req, res) => {
// 	try {
// 		const { message,senderId } = req.body;
// 		const { id: receiverId } = req.params;
// 		//const senderId = req.user._id;

// 		let conversation = await Conversation.findOne({
// 			participants: { $all: [senderId, receiverId] },
// 		});

// 		if (!conversation) {
// 			conversation = await Conversation.create({
// 				participants: [senderId, receiverId],
// 			});
// 		}

// 		const newMessage = new Message({
// 			senderId,
// 			receiverId,
// 			message,
// 		});

// 		if (newMessage) {
// 			conversation.messages.push(newMessage._id);
// 		}


// 		// this will run in parallel
// 		await Promise.all([conversation.save(), newMessage.save()]);

// 		// SOCKET IO FUNCTIONALITY WILL GO HERE
// 		const receiverSocketId = Socket.getReceiverSocketId(receiverId);
// 		if (receiverSocketId) {
// 			Socket.io.to(receiverSocketId).emit("newMessage", newMessage);
// 		}

// 		res.status(201).json(newMessage);
// 	} catch (error) {
// 		console.log("Error in sendMessage controller: ", error.message);
// 		res.status(500).json({ error: "Internal server error" });
// 	}
// };

const sendMessage = async (req, res) => {
	try {
		const { message, senderId } = req.body;
		const { id: receiverId } = req.params;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
			isDelivered: false,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		await Promise.all([conversation.save(), newMessage.save()]);

		const receiverSocketId = Socket.getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			Socket.io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};


const getMessages = async (req, res) => {
	try {
		const { id: userToChatId,senderId } = req.params;
		
		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages");

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getUsersForSidebar = async (req, res) => {
	try {
		const {id:loggedInUserId} = req.params;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

const markMessageAsDelivered = async (req, res) => {
	try {
		const { messageId } = req.params;
		
		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		message.isDelivered = true;
		await message.save();

		res.status(200).json({ message: "Message marked as delivered" });
	} catch (error) {
		console.log("Error in markMessageAsDelivered controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};



module.exports = {
    getMessages,
	sendMessage,
	getUsersForSidebar,
	markMessageAsDelivered
}
