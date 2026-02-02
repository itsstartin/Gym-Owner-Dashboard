import React from 'react'
import { useDispatch } from 'react-redux'
import { sidebarOn } from '../features/sidebarSlice'

function WelcomeHeader() {
  const dispatch = useDispatch()
  return (
    <div className='
    flex
    flex-col 
    items-start 
    justify-between
    text-white
    gap-0.5
    '>
        <button className='md:hidden' onClick={
          ()=>{
            dispatch(sidebarOn())
          }
        }>
            <img className='
            w-6
            h-6
            '></img>
        </button>
        <h1 className='text-3xl font-extrabold'>Welcome back, Admin</h1>
        <p className='text-gray-400 text-[15px]'>Here is what is happening at gym today</p>
    </div>
  )
}

export default WelcomeHeader