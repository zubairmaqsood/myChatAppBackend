import { Router } from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import { loginUser } from "../controller/userController.js";
import { signupUser } from "../controller/userController.js";
import { getProfile } from "../controller/userController.js";
import { updateProfile } from "../controller/userController.js";
const router = Router();

router.post("/login",loginUser)
router.post("/signup",signupUser)
router.get("/getProfile",isLoggedIn,getProfile)
router.patch("/updateProfile",isLoggedIn,updateProfile)
export default router;