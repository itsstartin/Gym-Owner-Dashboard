import React from 'react'
import {useDispatch} from 'react-redux'
import { sidebarOff } from '../features/sidebarSlice'
import { Dumbbell } from 'lucide-react'

function GymIcon() {
  const dispatch = useDispatch()
  return (
    <div className='
    flex
    justify-start
    items-center
    gap-3
    w-full
    px-2
    py-3
    mb-4
    '>
        <Dumbbell className='
        w-8
        h-8
        p-1
        bg-green-700
        rounded-lg
        shadow-lg
        shadow-green-950
        '/>
        
        <div className='
        flex
        flex-col
        w-full
        justify-center
        items-start
        '>
            <h1 className='text-sm font-extrabold tracking-tight'>GymHub Connect</h1>
            <p className='text-xs text-gray-400'>Admin Panel</p>

        </div>
        <div className='
        flex
        items-start
        h-full
        md:hidden
        '>
          <button className='
          rounded-md
          px-2
          py-1
          text-xs
          text-gray-300
          hover:bg-gray-800
          ' 
          onClick={()=>{
            dispatch(sidebarOff())
          }}
          >X</button>
        </div>
    </div>
  )
}

export default GymIcon
