import { User } from "../typings"

interface Shared {
    onlineUsers: User[];
}

const shared: Shared = {
    onlineUsers: []
}

export default shared