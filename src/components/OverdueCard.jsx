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
      }) 
    }
    finally{
      setIsLoading(false)
    }
  }
  return (
    <div className="
    flex flex-col rounded-lg border border-red-950 p-3 bg-gray-950 gap-3 transition-colors
    hover:border-red-800">
        <div className='flex justify-between'>
            <h1 className='font-medium'>{props.obj.name}</h1>
            <p className='font-semibold text-red-400'>₹ {props.obj.overdue_amount}</p>
        </div>
        <div className='flex justify-between'>
            <h1 className='text-sm text-gray-400'>{props.obj.membership_plan}</h1>
            <div className='flex gap-2'>
              <div className='rounded-md bg-red-950 px-2 py-1 text-xs font-semibold text-red-400'>
                  <h1>{`${props.obj.overdue_days} days overdue`}</h1>
              </div>
              {isLoading ?
              <ClipLoader size={20} color='#fff'/>
              :
              <button type='button' aria-label='Notify member' title='Notify member' className='rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white' onClick={()=>notifyOverdueMembers(props.obj)}><Send size={18}/></button>
              }
            </div>
        </div>
    </div>
  )
}

export default OverdueCard
