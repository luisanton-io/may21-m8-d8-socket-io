import list from "express-list-endpoints";
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import makeHandlers from './sockets/handlers';

process.env.TS_NODE_DEV && require("dotenv").config()

// We cannot start a socket.io server on a express app.
// We need to create our express app config and pass it to a standard Node.js HTTP server
// This server will be used to initialize our socket.io server.

const httpServer = createServer(app)

// initializing our socket.io server....

const io = new Server(httpServer, { allowEIO3: true })

io.on('connection', socket => {
    console.log(socket.id)

    Object.entries(makeHandlers(socket))
        .forEach(([event, handler]) => {
            socket.on(event, handler)
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