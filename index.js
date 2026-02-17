import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import "dotenv/config";
import path from 'path';
const app = express();
const port = process.env.PORT || 3000;
import "./config/mongooseConfig.js";
import userRouter from "./router/userRouter.js";
import messageRouter from "./router/messageRouter.js";
import { ADD_USER_EVENT } from './utils/constants.js';
import { SEND_MESSAGE_EVENT } from './utils/constants.js';
import { DISCONNECT_EVENT } from './utils/constants.js';
import { CONNECT_EVENT } from './utils/constants.js';
import { SELF_ONLINE_EVENT } from './utils/constants.js';
import { ONLINE_USERS_EVENT } from './utils/constants.js';
import { SELF_OFFLINE_EVENT } from './utils/constants.js';

// http server
const server = http.createServer(app)

// socket.io server
const io = new Server(server,{
  cors:{
    origin:"http://localhost:5173",
    methods:["GET","POST"]
  }
})

// express middlewares
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use("/uploads",express.static(path.join(process.cwd(),"uploads")))

// express routes
app.use("/users",userRouter)
app.use("/messages",messageRouter)

const onlineUsers = new Map()

// socket.io connection
io.on(CONNECT_EVENT,(socket)=>{
  console.log("A user connected with id: ",socket.id)
  
  socket.on(ADD_USER_EVENT,(userId)=>{
    socket.userId = userId
    onlineUsers.set(userId,socket.id)
    socket.broadcast.emit(SELF_ONLINE_EVENT,userId)

    const onlineUsersList = Array.from(onlineUsers.keys())
    socket.emit(ONLINE_USERS_EVENT,onlineUsersList)
  })

  socket.on(SEND_MESSAGE_EVENT,(data)=>{
    const sendUserSocket = onlineUsers.get(data.to)
    if(sendUserSocket){
      socket.to(sendUserSocket).emit(SEND_MESSAGE_EVENT,{
        ...data,
        from: socket.userId
      })
    }
  })

  socket.on(DISCONNECT_EVENT,()=>{
    if(socket.userId){
      onlineUsers.delete(socket.userId)
      socket.broadcast.emit(SELF_OFFLINE_EVENT,socket.userId)
    }
  })
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});