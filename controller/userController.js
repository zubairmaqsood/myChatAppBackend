import userModel from "../model/userModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import {uploads} from "../config/multerConfig.js";

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
    delete userResponse.createdAt
    delete userResponse.updatedAt
    res.status(200).json({user:userResponse, token });
  } catch (error) {
    console.error( err.message);
    res.status(500).json({ message: "Internal Server Error" });
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
    delete userResponse.createdAt
    delete userResponse.updatedAt
    res.status(201).json({ user:userResponse, token });
  } catch (error) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// for our own profile data
export const getProfile = async(req,res)=>{
  const userId = req.user._id
  try{
    const user = await userModel.findById(userId).select("-password -updatedAt")
    if(!user) return res.status(404).json({message:"User not found"})
    res.status(200).json(user)
  }catch(err){
   console.error( err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// for uplod of profile pic or delete profile pic
export const updateProfile = async (req, res) => {
  uploads.single("profilePic")(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    
    try {
      const userId = req.user._id;
      const { name, password, removeProfilePic } = req.body; 
      const updatedData = {};

      if (name) updatedData.name = name;
      if (password) {
        const salt = await bcrypt.genSalt(12);
        updatedData.password = await bcrypt.hash(password, salt);
      }

      // 1. Fetch the user FIRST so we know what their old picture was!
      const currentUser = await userModel.findById(userId);

      // SCENARIO A: They uploaded a NEW picture
      if (req.file) {
        updatedData.profilePic = req.file.filename;
        
        // Delete the OLD picture from the server hard drive!
        if (currentUser.profilePic) {
          const oldPath = path.join("uploads/profilePics", currentUser.profilePic);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); 
        }
      } 
      // SCENARIO B: They clicked "Remove Photo" (no file attached)
      else if (removeProfilePic === "true" || removeProfilePic === true) {
        updatedData.profilePic = null; // Clear it in the database
        
        // Delete the OLD picture from the server hard drive!
        if (currentUser.profilePic) {
          const oldPath = path.join("uploads/profilePics", currentUser.profilePic);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      // 2. Save the new data to MongoDB
      const updatedUser = await userModel.findByIdAndUpdate(
        userId, updatedData, { new: true, runValidators: true }
      ).select("-password -createdAt -updatedAt -email");

      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ user: updatedUser });
      
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};


export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user but NEVER send the password back!
        const user = await userModel.findById(id).select("-password -updatedAt -email -createdAt");

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Send the user data back to your frontend
        res.status(200).json({ user });
    } catch (err) {
        console.error("Error in getUserById: ", err.message);
        
        // If the ID format is completely invalid (not a valid MongoDB ObjectId)
        if (err.kind === "ObjectId") {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
};

// to search user searched by search bar

export const searchUsers = async (req, res) => {
    try {
        // 1. Grab the search word from the URL query
        const keyword = req.query.keyword;

        // If they didn't type anything, return an empty array
        if (!keyword) {
            return res.status(200).json({ users: [] });
        }

        // 2. Create the MongoDB search query
        // $regex: keyword -> Looks for partial matches (e.g., "zub" matches "Zubair")
        // $options: "i" -> Makes it case-insensitive
        const searchQuery = {
            name: { $regex: keyword, $options: "i" },
            _id: { $ne: req.user._id } // $ne means "Not Equal". Excludes the logged-in user!
        };

        // 3. Find the users and remove passwords from the result
        const users = await userModel.find(searchQuery).select("-password -createdAt -updatedAt -email");

        res.status(200).json({ users });

    } catch (error) {
        console.error("Error in searchUsers controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};