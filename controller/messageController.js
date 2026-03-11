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
        return res.status(500).json({message:err.message})
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
        return res.status(500).json({message:err.message})
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
        return res.status(500).json({message:err.message})
    }
}