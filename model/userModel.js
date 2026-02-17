import {Schema,model} from "mongoose";

const userSchema= new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        match:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    profilePic:String
},{
    timestamps:true
})

export default model("User",userSchema)