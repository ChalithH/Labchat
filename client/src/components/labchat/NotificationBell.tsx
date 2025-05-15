import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/lib/useSocket';
import { Button } from '../ui/button';

interface Notification {
  message: string
  timestamp: string
}

interface NotificationBellPropTypes {
  userId: string
}

export const NotificationBell = ({ userId }: NotificationBellPropTypes) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const handleNotification = useCallback((data: Notification) => {
    setNotifications((prev) => [data, ...prev])
  }, [])

  useSocket({ userId, onNotification: handleNotification })

  return (
    <Button variant="outline" className="w-12 h-12">
      <div className="relative"> 🛎️

        { notifications.length > 0 &&
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            { notifications.length }
          </span>
        }

        { notifications.length > 0 && 
          <ul className="absolute bg-white border rounded shadow p-2 mt-2 right-0 z-50 w-64">
            { notifications.map((notif, index) => (
              <li key={ index } className="py-1 text-sm border-b last:border-b-0">
                <p>{ notif.message }</p>
                <span className='italic'>{ notif.timestamp }</span>
              </li>
            ))}
          </ul>
        }
      </div>
    </Button>
  );
}
