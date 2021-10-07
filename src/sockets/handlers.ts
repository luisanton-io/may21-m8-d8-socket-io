import { Socket } from "socket.io"
import RoomModel from "../app/room/model"
import shared from "../shared"

const makeHandlers = (socket: Socket) => ({
    setUsername: ({ username, room }: { username: string, room: string }) => {
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
    },
    sendmessage: async ({ message, room }: { message: string, room: string }) => {
        // const { text, sender, id, timestamp } = message

        // ... we should save the message to the database here...

        await RoomModel.findOneAndUpdate({ room }, {
            $push: { chatHistory: message }
        })

        // ... and then broadcast the message to the recipient(s)
        // socket.broadcast.emit("message", message)
        socket.to(room).emit("message", message)

    },
    disconnect: () => {
        shared.onlineUsers = shared.onlineUsers.filter(user => user.id !== socket.id)
        socket.broadcast.emit("newConnection")
    }
})

export default makeHandlers