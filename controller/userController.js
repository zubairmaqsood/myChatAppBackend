import userModel from "../model/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";

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

