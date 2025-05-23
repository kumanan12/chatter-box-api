import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req,res) => {
    try {
         const loggedInUser = req.user.id;
         const filteredUsers = await User.find({_id: {$ne : loggedInUser} }).select('-password')

         res.status(200).json(filteredUsers)
        
     } catch (error) {

        console.log('Error in getUsersForSideBar: ', error.message);
        res.status(500).json({message : 'internal server error'})
        
        
     }
}


export const getMessages = async (req,res) => {
    try {
        const { id:userToChatId } = req.params
        const myId = req.user._id

        const messages = await Message.find({
            $or : [
                { senderId:myId , receiverId:userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log( 'Error in the getMessages controller: ' , error.message);
        res.status(500).json({message : 'Internal Server Error'})
        
        
    }
}


export const sendMessage = async (req,res) => {
    try {
        const { text, image } = req.body
        const {id: receiverId } = req.params
        const senderId = req.user._id

        /* 
            let ImageUrl
            ...code for images finally if I have time
        */

            const newMessage  = new Message({
                senderId,
                receiverId,
                text,
            })

            await newMessage.save()

            const receiverSocketId = getReceiverSocketId(receiverId);
            if(receiverSocketId){
                io.to(receiverSocketId).emit('newMessage', newMessage)
            }else{
                console.log(`Receiver ${receiverId} is offline. No socket found.`);
            }

            res.status(200).json(newMessage)

    } catch (error) {
        console.log('Error in the sendMessage controller: ', error.message);
        res.status(500).json({message : 'Internal server Error'})
        
    }
}


/*     const messages = await Message.model.find({ 
     
    this was the change made -> in the error
*/