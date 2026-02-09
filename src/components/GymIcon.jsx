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
    gap-4
    w-full
    p-2
    pt-3
    pb-5
    '>
        <Dumbbell className='
        w-8
        h-8
        p-1
        bg-green-800
        rounded-[8px]
        '/>
        
        <div className='
        flex
        flex-col
        w-full
        justify-center
        items-start
        '>
            <h1 className='text-sm font-extrabold'>GymPro Connect</h1>
            <p className='text-xs'>Admin Panel</p>

        </div>
        <div className='
        flex
        items-start
        h-full
        md:hidden
        '>
          <button className='
          w-1
          h-1
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