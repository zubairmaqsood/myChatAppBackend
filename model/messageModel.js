import { Schema,model } from "mongoose";

const messageSchema= new Schema({
    message:{
        text:{
            type:String,
            required:true
        }
    },
    users:[{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true
    }],
    sender:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true
    }
},{
    timestamps:true
})

export default model("Message",messageSchema)