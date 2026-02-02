import React from 'react'
import {useDispatch} from 'react-redux'
import { sidebarOff } from '../features/sidebarSlice'

function GymIcon() {
  const dispatch = useDispatch()
  return (
    <div className='
    flex
    justify-center
    items-center
    gap-1
    '>
        <img className='
        w-8
        h-8
        '>
        </img>
        <div className='
        flex
        flex-col
        justify-center
        items-start
        '>
            <h1>GymPro Connect</h1>
            <p>Admin Panel</p>

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