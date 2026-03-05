import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { dashboardOn } from '../features/currentPageSlice'

function LogoutBox() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <div className='
    fixed
    inset-0
    flex
    items-center
    justify-center
    bg-white/40
    '>
        <div className='
        flex
        flex-col
        items-center
        justify-center
        bg-gray-950
        text-white
        rounded-[8px]
        gap-2
        p-4
        '>
            <h1 className='text-2xl font-bold'>Logout</h1>
            <p className='text-gray-400'>Are you sure you want to logout?</p>
            <button className='bg-red-500 text-white px-4 py-2 rounded-lg' onClick={handleLogout}>Logout</button>
            <button className='bg-gray-500 text-white px-4 py-2 rounded-lg' onClick={()=>{dispatch(dashboardOn())}}>Cancel</button>
        </div>
    </div>
  )
}

export default LogoutBox