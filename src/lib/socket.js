import {Server} from "socket.io"
import http from 'http'
import express from "express"
import { log } from "console";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin : ['http://localhost:5173', 'http://localhost:5174'],
        methods: ["GET", "POST"],
    credentials: true,
    }
})

export function getReceiverSocketId(userId) {
  return userSocketList[userId];
}

const userSocketList = {}

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const userId = socket.handshake.query.userId
    if(userId){
        userSocketList[userId] = socket.id
    }

    io.emit("onlineUsers", Object.keys(userSocketList))
    
    console.log(`Current online users: ${Object.keys(userSocketList)}`);

    socket.on('disconnect', () => {
        console.log('the user disconnected', socket.id);
        delete userSocketList[userId]
        io.emit('onlineUsers', Object.keys(userSocketList))
        
    })
    
})



export {app, io, server}