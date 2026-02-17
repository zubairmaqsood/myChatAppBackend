import { Router } from "express";
import { getMessages } from "../controller/messageController.js";
import { createMessage } from "../controller/messageController.js";
import { getUserChats } from "../controller/messageController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
const router = Router();

router.get("/:id",isLoggedIn,getMessages)
router.post("/send",isLoggedIn,createMessage)
router.get("/chats",isLoggedIn,getUserChats)

export default router;