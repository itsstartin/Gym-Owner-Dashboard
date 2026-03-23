import { LucideClockFading, Send } from 'lucide-react'
import React, { useState } from 'react'
import axios from '../axios'
import {ClipLoader} from 'react-spinners'

function OverdueCard(props) {
  const [isLoading,setIsLoading]=useState(false)
  const notifyOverdueMembers = async(obj)=> {
    setIsLoading(true)
    try{
      await axios.post('members/overdue/notify',obj).then(()=>{
        console.log("Notified Overdue Member")
      }) 
    }
    finally{
      setIsLoading(false)
    }
  }
  return (
    <div className="
    flex flex-col rounded-[8px] p-2 bg-gray-900 gap-2 outline-1
    outline-red-800
    hover:outline-red-500">
        <div className='flex justify-between'>
            <h1>{props.obj.name}</h1>
            <p>₹ {props.obj.overdue_amount}</p>
        </div>
        <div className='flex justify-between'>
            <h1>{props.obj.membership_plan}</h1>
            <div className='flex gap-2'>
              <div className='bg-red-600 p-0.5 rounded-lg'>
                  <h1>{`${props.obj.overdue_days} days overdue`}</h1>
              </div>
              {isLoading ?
              <ClipLoader size={20} color='#fff'/>
              :
              <Send onClick={()=>notifyOverdueMembers(props.obj)}/>
              }
            </div>
        </div>
    </div>
  )
}

export default OverdueCard