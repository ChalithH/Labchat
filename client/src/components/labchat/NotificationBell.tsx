import { useState, useCallback, useEffect } from 'react'
import { useSocket } from '@/lib/useSocket'
import { Button } from '../ui/button'
import api from '@/lib/api'
import { Badge } from '../ui/badge'
import { ScrollArea } from "@/components/ui/scroll-area"

type Notification = {
  id: number
  message: string
  timestamp: string
  read: boolean
}

type NotificationBellPropTypes = {
  userId: string
}

export const NotificationBell = ({ userId }: NotificationBellPropTypes) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(`/notification/${ userId }`)
        setNotifications(response.data)

      } catch (error) {
        console.error(error)
      }
    }

    fetchNotifications()
  }, [userId])

  const handleNotification = useCallback((data: Notification) => {
    setNotifications((prev) => [data, ...prev])
  }, [])

  const toggleNotificationMenu = async () => {
    setIsOpen(!isOpen)
  }

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notification/read/${ id }`)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const clearNotification = async (id: number) => {
    try {
      await api.delete(`/notification/${ id }`)
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))

    } catch (error) {
      console.error(error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      await api.delete(`/notification/clear-all/${ userId }`)
      setNotifications([])

    } catch (error) {
      console.error(error)
    }
  }

  const numberOfUnread = notifications.filter((notification) => !notification.read).length
  useSocket({ userId, onNotification: handleNotification })

  return (
      <div className="relative"> 
        <Button variant="outline" className="w-12 h-12" onClick={ toggleNotificationMenu }>
          <p>🛎️</p>

          { numberOfUnread > 0 &&
            <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              { numberOfUnread }
            </span>
          }
        </Button>

        {isOpen &&
          <div className="absolute right-0 mt-2 z-50 w-[70vw] max-w-[500px] sm:w-[400px] md:w-[450px] bg-white border rounded shadow">
            <ScrollArea className="h-80 p-2">
              <ul className="space-y-2">
                { notifications.length === 0 && (
                  <p className="barlow-font italic text-sm">You have no unread notifications</p>
                )}

                { [...notifications]
                  .sort((a, b) => Number(a.read) - Number(b.read)) // unread (false=0) first
                  .map((notification, index) => (
                  <li key={ index } className={ `barlow-font py-1 mb-1 text-sm rounded border-b last:border-b-0 ${ notification.read ? "bg-gray-50" : "bg-white" }` }>
                    <div className="flex justify-between items-center">
                      <p className={ `line-clamp-3 ${ notification.read ? "text-gray-400" : "text-black" }` }>
                        { notification.message }
                      </p>

                      { !notification.read ?
                        <Badge className="cursor-pointer text-sm" onClick={ () => markAsRead(notification.id) }>
                          Mark as Read
                        </Badge>
                      :
                        <Button className="cursor-pointer w-14 h-6 text-sm" onClick={ () => clearNotification(notification.id) }>
                          Clear
                        </Button>
                      }
                    </div>
                    <span className="italic text-xs text-gray-400">
                      { notification.timestamp }
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>

          { notifications.length > 0 &&
            <Button className="w-full text-center" onClick={ clearAllNotifications }>
              Clear All
            </Button>
          } 
        </div>
      }
    </div>
  )
}
