import express from 'express'
import UserModel from './model'

const usersRouter = express.Router()

usersRouter.post('/', async (req, res) => {
    // creating a new user...

    const newUser = new UserModel(req.body)
    await newUser.save()

    res.status(201).send(newUser)
})

usersRouter.get('/:id', async (req, res) => {
    const user = await UserModel.findById(req.params.id)

    if (!user) {
        res.status(404).send()
    } else res.status(200).send(user)

})


export default usersRouter