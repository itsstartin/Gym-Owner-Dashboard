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
        catch(err){
            console.error("Error marking notification:", err)
        }
    }
  return (
    <div
            key={props.obj.id}
            className={`flex items-center justify-between p-4 rounded-xl shadow-sm  outline-gray-700 ${
              read ? "bg-gray-900 outline-1" : "bg-gray-800 outline-2"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`w-2 h-2 mt-2 rounded-full ${
                  read ? "bg-gray-400" : "bg-green-500"
                }`}
              />

              <div>
                <p className="text-sm">{props.obj.message}</p>
                <span className="text-xs text-gray-500">Time</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-red-500 outline-1 rounded-md outline-gray-700 p-1 ">{props.obj.type}</span>
              <button onClick={() => markAsRead(props.obj.id)}>
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