import Chat from "../models/chat.js"


//API Controller for creating a new chat
export const createChat = async (req, res) => {
    try {
        const userId = req.user._id

        const chatData = {
            userId, 
            message: [],
            name: "New chat", 
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json({success: true, message: "Chat Created"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//API Controller For Geting All Chats
export const getChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({userId}).sort({updateAt: -1})

        res.json({success: true, chats})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//API Controller For Deleting a Chat
export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id
        const {chatId} = req.body
        
        await Chat.deleteOne({_id: chatId, userId})

        res.json({success: true, message: "chat Deleted"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
