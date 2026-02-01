import React from 'react'
import SideBar from '../combinedComponents/SideBar'
import DashboardContent from '../combinedComponents/DashboardContent'
import MemberMenuContent from '../combinedComponents/MemberMenuContent'

function MainPage() {
  return (
    <div className='
    flex
    font-sans-serif
    bg-gray-950
    text-white
    '>
        <SideBar/>
        <DashboardContent/>
    </div>
  )
}

export default MainPage