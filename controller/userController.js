import userModel from "../model/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import {uploads} from "../middlewares/multerConfig.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const result = await bcrypt.compare(password, user.password);
    if (!result)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    const userResponse = user.toObject()
    delete userResponse.password
    res.status(200).json({user:userResponse, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const signupUser = async (req, res) => {
  try {
    const { ...rest } = req.body;
    const existingUser = await userModel.findOne({ email: rest.email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(rest.password, salt);

    //creating user
    const user = await userModel.create({ ...rest, password: hashedPassword });
    const token = generateToken(user);

    const userResponse = user.toObject()
    delete userResponse.password
    res.status(201).json({ user:userResponse, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async(req,res)=>{
  const userId = req.user._id
  try{
    const user = await userModel.findById(userId).select("-password")
    if(!user) return res.status(404).json({message:"User not found"})
    res.status(200).json({user})
  }catch(err){
    res.status(500).json({message:err.message})
  }
}

export const updateProfile = async(req,res)=>{

  //middleware to handle file upload
  uploads.single("profilePic")(req,res,async (err)=>{
    if(err) return res.status(400).json({message:err.message})
    try{
      const userId = req.user._id
      const {name,password} = req.body
      const updatedData = {}
      if(name) updatedData.name = name
      if(password){
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        updatedData.password = hashedPassword
      }

      if(req.file) updatedData.profilePic = req.file.filename

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,updatedData,{new:true,runValidators:true}
      ).select("-password")

      if(!updatedUser) return res.status(404).json({message:"User not found"})
      res.status(200).json({user:updatedUser})
    }catch(err){
      res.status(500).json({message:err.message})
    }
  })


}