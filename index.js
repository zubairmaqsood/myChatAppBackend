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
import { ADD_USER_EVENT,RECIEVE_MESSAGE_EVENT,SEND_MESSAGE_EVENT,DISCONNECT_EVENT,CONNECT_EVENT,
NEW_ONLINE_EVENT,ONLINE_USERS_EVENT ,NEW_OFFLINE_EVENT ,UPDATE_PROFILE,FRIEND_UPDATE_PROFILE} 
from './utils/constants.js';


// http server
const server = http.createServer(app)

// socket.io server
const io = new Server(server,{
  cors:{
    origin:"http://localhost:5173"
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
  
  socket.on(ADD_USER_EVENT,(userId)=>{
    socket.userId = userId
    onlineUsers.set(userId,socket.id)
    socket.broadcast.emit(NEW_ONLINE_EVENT,userId) // to tell everyone i am onine 

    const onlineUsersList = Array.from(onlineUsers.keys())
    socket.emit(ONLINE_USERS_EVENT,onlineUsersList)// to know who else is online 
  })

  socket.on(SEND_MESSAGE_EVENT,(data)=>{
    const sendUserSocket = onlineUsers.get(data.to)
    if(sendUserSocket){
      socket.to(sendUserSocket).emit(RECIEVE_MESSAGE_EVENT,{
        ...data,
        from: socket.userId
      })
    }
  })

  // for updation of profile data
  socket.on(UPDATE_PROFILE, (updatedUserData) => {
    // Broadcast it to EVERYONE ELSE connected to the app
    socket.broadcast.emit(FRIEND_UPDATE_PROFILE, updatedUserData);
  });

  socket.on(DISCONNECT_EVENT,()=>{
    // Look up what socket ID is currently saved for this user
    const savedSocketId = onlineUsers.get(socket.userId);

    // ONLY delete them if the saved ID matches the disconnecting ID.
    // If it doesn't match, it means they already refreshed and reconnected on a new socket!
    if (savedSocketId === socket.id) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit(NEW_OFFLINE_EVENT, socket.userId);
    }
  })
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});