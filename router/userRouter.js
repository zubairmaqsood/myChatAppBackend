import { Router } from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import { getUserById, loginUser,searchUsers,signupUser,getProfile,updateProfile } from "../controller/userController.js";

const router = Router();

router.post("/login",loginUser)
router.post("/signup",signupUser)
router.get("/getProfile",isLoggedIn,getProfile)
router.get("/search", isLoggedIn, searchUsers);
router.get("/:id",isLoggedIn,getUserById)
router.patch("/updateProfile",isLoggedIn,updateProfile)
export default router;