import { Server } from 'socket.io'


const onlineUsers: Map<string, string> = new Map<string, string>()

export const setupSocket= (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${ socket.id }`)

    socket.on('register', (userId: string) => {
      onlineUsers.set(userId, socket.id)
      console.log(`User ${ userId } registered with socket ${ socket.id }`)
    })

    socket.on('disconnect', () => {
      for (const [userId, id] of onlineUsers) {
        if (id === socket.id) {
          onlineUsers.delete(userId)
          console.log(`User ${ userId } disconnected`)
          break
        }
      }
    })
  })
}

export const notifyUser = (io: Server, userId: string, data: any) => {
  // Try find user from map of online users and send notification
  const socketId = onlineUsers.get(userId)
  if (socketId)
    io.to(socketId).emit('notification', data)
}
