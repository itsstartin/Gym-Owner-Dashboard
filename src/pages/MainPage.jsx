import React from 'react'
import SideBar from '../combinedComponents/SideBar'
import DashboardContent from '../combinedComponents/DashboardContent'
import { useSelector } from 'react-redux'
import MemberMenuContent from '../combinedComponents/MemberMenuContent'

function MainPage() {
  const currentPageState = useSelector((state)=>state.currentPageState.value)
  return (
    <div className='
    flex
    font-sans-serif
    bg-gray-950
    text-white
    '>
        <SideBar/>
        {
          currentPageState==='Dashboard' ?
          <DashboardContent/>
          :
          currentPageState==='Members' ?
          <MemberMenuContent/>
          :''
        }
    </div>
  )
}

export default MainPage