import { Schema } from 'mongoose'
import { UserDB } from '../../../typings'


const UserSchema = new Schema<UserDB>({
    username: { type: String, required: true },
    email: { type: String, required: true }
})

export default UserSchema