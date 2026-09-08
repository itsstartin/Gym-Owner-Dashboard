import React from 'react'
import { useDispatch } from 'react-redux'
import { sidebarOn } from '../features/sidebarSlice'
import { Menu } from 'lucide-react'

function WelcomeHeader(props) {
  const dispatch = useDispatch()
  return (
    <div className='
    flex
    flex-col 
    items-start 
    justify-between
    text-white
    gap-1
    '>
        <button aria-label='Open navigation' className='mb-2 rounded-lg border border-gray-800 bg-gray-900 p-2 text-gray-200 hover:bg-gray-800 md:hidden' onClick={
          ()=>{
            dispatch(sidebarOn())
          }
        }>  
            <Menu/>
        </button>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{props.header ? props.header :'Welcome back, Admin'}</h1>
        <p className='text-sm text-gray-400 sm:text-[15px]'>{props.desc ? props.desc :'Here is what is happening at gym today'}</p>
    </div>
  )
}

export default WelcomeHeader
