import jwt from "jsonwebtoken";

const generateToken = (user)=>{
    const token = jwt.sign(
        {email:user.email,id:user._id},
        process.env.JWT_KEY,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    )
   return token
}

export default generateToken