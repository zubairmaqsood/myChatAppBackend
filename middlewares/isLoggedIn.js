import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "unauthorized user" });
    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({message:error.message});
  }
};

export default isLoggedIn;
