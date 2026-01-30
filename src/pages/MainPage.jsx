import React from 'react'
import SideBar from '../combinedComponents/SideBar'
import DashboardContent from '../combinedComponents/DashboardContent'
import MemberMenuContent from '../combinedComponents/MemberMenuContent'

function MainPage() {
  return (
    <div className='
    flex
    '>
        <SideBar/>
        <MemberMenuContent/>
    </div>
  )
}

export default MainPage