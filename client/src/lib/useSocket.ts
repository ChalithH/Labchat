import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

interface UseSocketProps {
  userId: string
  onNotification: (data: any) => void
}

export const useSocket = ({ userId, onNotification }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId)
      return

    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!, { withCredentials: true })
    socketRef.current = socket
    socket.emit('register', userId)
    socket.on('notification', onNotification)

    socket.on('connect', () => {
      console.log('Connected to socket server', socket!.id)
    })

    return () => {
      socket?.disconnect()
    }
  }, [userId, onNotification])

  return socketRef.current
}
