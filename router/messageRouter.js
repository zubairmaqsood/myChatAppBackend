import { Router } from "express";
import { getMessages } from "../controller/messageController.js";
import { createMessage } from "../controller/messageController.js";
import { getUserChats } from "../controller/messageController.js";
import  isLoggedIn from "../middlewares/isLoggedIn.js";
const router = Router();

router.get("/chats",isLoggedIn,getUserChats)
router.post("/send",isLoggedIn,createMessage)
router.get("/:id",isLoggedIn,getMessages)

export default router;