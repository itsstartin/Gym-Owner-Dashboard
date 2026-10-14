import { Check, CheckCheck, Star } from 'lucide-react'
import React, { useState } from 'react'
import axios from '../axios'

function NotificationCard(props) {
    const [read,markRead]=useState(props.obj.is_read)
    const markAsRead = async (id) => {
        try{
            await axios.post(`members/readnotification/${id}`)
            markRead(true)
        }
        catch {
            return undefined
        }
    }
  return (
    <div
            key={props.obj.id}
            className={`flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm transition-colors ${
              read ? "border-gray-800 bg-gray-900/70" : "border-green-900 bg-gray-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`w-2 h-2 mt-2 rounded-full ${
                  read ? "bg-gray-400" : "bg-green-500"
                }`}
              />

              <div>
                <p className="text-sm leading-5">{props.obj.message}</p>
                <span className="mt-1 block text-xs text-gray-500">Notification</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-md bg-red-950 px-2 py-1 text-xs font-semibold text-red-400">{props.obj.type}</span>
              <button type='button' aria-label={read ? 'Read' : 'Mark as read'} title={read ? 'Read' : 'Mark as read'} className='rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-green-400' onClick={() => markAsRead(props.obj.id)}>
                {
                    read ?
                    <CheckCheck/>
                    : 
                    <Check className='bg-gray-700'/>
                  }
                
              </button>
            </div>
          </div>
  )
}

export default NotificationCard
