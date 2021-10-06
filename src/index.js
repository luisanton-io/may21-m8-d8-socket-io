import express from 'express';
import cors from 'cors'
import { createServer } from 'http';
import { Server } from 'socket.io'

// We cannot start a socket.io server on a express app.
// We need to create our express app config and pass it to a standard Node.js HTTP server
// This server will be used to initialize our socket.io server.

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)

// initializing our socket.io server....

const io = new Server(httpServer, { allowEIO3: true })

io.on('connection', socket => {
    console.log(socket.id)

    socket.on('message', ({ message }) => {
        console.log(message)
    })

    socket.on("loggedIn", (payload) => {
        socket.emit('welcome', { message: "Welcome" })
        socket.broadcast.emit("newOnlineUser", { id: socket.id })
    })



})

// Now listening...

httpServer.listen(3030, () => {
    console.log("Server listening on port 3030")
})