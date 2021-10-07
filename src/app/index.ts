// Inside of this app.ts i am going to initialize the express app.

// This way I can easily import it in the index.ts (where it will actually be run)
// as well as in the __tests__ (where it will be tested).

import express from 'express';
import cors from 'cors'
import RoomModel from './room/model';
import shared from '../shared';
import usersRouter from './services/users';

const app = express()
app.use(cors())
app.use(express.json())

app.get('/test', (req, res) => {
    res.status(200).send({ message: "Test success" })
})

app.get('/online-users', (req, res) => {
    res.status(200).send({ onlineUsers: shared.onlineUsers })
})

app.get("/rooms/:name", async (req, res) => {
    const room = await RoomModel.findOne({ room: req.params.name })

    res.send(room.chatHistory)
})

app.use('/users', usersRouter)

export default app