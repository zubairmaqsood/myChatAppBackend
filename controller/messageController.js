import messageModel from "../model/messageModel.js";

// For specific chat messages between two users
export const getMessages = async (req, res) => {
    try{
        const reciverId = req.params.id
        const senderId = req.user._id

        let messages = await messageModel.find({users:{$all:[senderId,reciverId]}})
        .sort({createdAt:1}) 

        const projectedMessages = messages.map((msg) => {
            return {
                _id: msg._id,
                fromSelf: msg.sender.toString() === senderId.toString(),
                message: msg.message.text,
                time: msg.createdAt
            };
        });
        res.status(200).json(projectedMessages);
    }catch(err){
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


// For creating a new message
export const createMessage = async(req,res)=>{
    try{
        const senderId = req.user._id
        const {to,text} = req.body
        if (!to || !text) {
        return res.status(400).json({ message: "Receiver ID and message are required" });
        }
        const message = await messageModel.create({
            message:{text},
            users:[senderId,to],
            sender:senderId
        }) 

        return res.status(201).json({message})
    }catch(err){
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Getting User's chats for sidebar
export const getUserChats = async(req,res)=>{
    try{
        const userId = req.user._id
        const chats = await messageModel.aggregate([
            {
                $match: {users:userId}
            },
            {
                $sort:{createdAt:-1}
            },
            {
                $group:{
                    _id:{
                        $cond:{
                            if:{$eq:[{$arrayElemAt:["$users",0]},userId]},
                            then:{$arrayElemAt:["$users",1]},
                            else:{$arrayElemAt:["$users",0]}
                        }
                    },
                    lastMessage:{$first:"$message.text"},
                    lastMessageTime:{$first:"$createdAt"}
                }
            },
            {
               $lookup:{
                    from:"users",
                    localField:"_id",
                    foreignField:"_id",
                    as:"userInfo"
               } 
            },
            {
                $unwind:{
                    path:"$userInfo",
                    preserveNullAndEmptyArrays:true
                }
            },
            {
                $project:{
                    _id:1,
                    name:"$userInfo.name",
                    profilePic:"$userInfo.profilePic",
                    lastMessage:1,
                    lastMessageTime:1
                }
            },
            {
                $sort:{lastMessageTime:-1}
            }
        ])
        res.status(200).json(chats) 
    }catch(err){
        console.error( err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// for deleting chats of user
export const deleteChat = async (req, res) => {
    try {
        const myId = req.user._id; // From auth middleware
        const userId = req.params.id; // The user to delete the chat with

        // Delete all messages where BOTH users are in the 'users' array
        const result = await messageModel.deleteMany({
            users: { $all: [myId, userId] }
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No chat history found to delete." });
        }

        res.status(200).json({ message: "Chat deleted successfully." });
    } catch (err) {
        console.error("Error in deleteChat:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};