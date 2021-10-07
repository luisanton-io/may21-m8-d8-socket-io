import { model } from 'mongoose'
import { UserDB } from '../../../typings'
import UserSchema from './schema'

const UserModel = model<UserDB>('users', UserSchema)

export default UserModel