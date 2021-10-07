import express from 'express';
import cors from 'cors'
import { createServer } from 'http';
import { Server } from 'socket.io'
import mongoose from 'mongoose';
import RoomModel from './app/room/model'
import list from "express-list-endpoints"
import app from './app';
import shared from './shared';

process.env.TS_NODE_DEV && require("dotenv").config()

// We cannot start a socket.io server on a express app.
// We need to create our express app config and pass it to a standard Node.js HTTP server
// This server will be used to initialize our socket.io server.

const httpServer = createServer(app)

// initializing our socket.io server....

const io = new Server(httpServer, { allowEIO3: true })

io.on('connection', socket => {
    console.log(socket.id)

    socket.on("setUsername", ({ username, room }) => {
        console.log(username)

        // Rooms are a server-side concept which allows socket to send a message only 
        // to some recipients who previously "joined" that room
        socket.join(room)

        // By default, when a socket is connecting, it's joining a room with the same id as its socket id
        console.log(socket.rooms)

        shared.onlineUsers.push({ username, id: socket.id, room })

        // .emit                 will send the message back to the other side of the current channel
        // .broadcast.emit       will send the message to every other connected socket
        // .to(room).emit        will send the message to every socket connected in that room

        socket.emit("loggedin")
        socket.broadcast.emit("newConnection")
    })

    socket.on("sendmessage", async ({ message, room }) => {
        // const { text, sender, id, timestamp } = message

        // ... we should save the message to the database here...

        await RoomModel.findOneAndUpdate({ room }, {
            $push: { chatHistory: message }
        })

        // ... and then broadcast the message to the recipient(s)
        // socket.broadcast.emit("message", message)
        socket.to(room).emit("message", message)

    })

    socket.on("disconnect", () => {
        shared.onlineUsers = shared.onlineUsers.filter(user => user.id !== socket.id)
        socket.broadcast.emit("newConnection")
    })

})

// Now listening...

if (!process.env.MONGO_URL) {
    throw new Error("No Mongo url defined.")
}

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        httpServer.listen(3030, () => {
            console.log(list(app))
            console.log("Server listening on port 3030")
        })
    })