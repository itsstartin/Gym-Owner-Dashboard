import React from 'react'
import GymIcon from '../components/GymIcon'
import IconDescBtn from '../components/IconDescBtn'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, ChartColumn, CreditCard, LayoutDashboard,  LogOut,  Settings, Users } from 'lucide-react';
import { dashboardOn, membersOn } from '../features/currentPageSlice';

function SideBar() {
  const sidebarState = useSelector((state)=>state.sidebarState.value)
  const dispatch = useDispatch()

  return (
    <div className={`
    flex
    flex-col
    self-start
    fixed
    ${sidebarState ? 'translate-x-0' :'-translate-x-full'}
    md:sticky md:translate-x-0
    top-0
    justify-between
    min-w-55
    max-w-55
    p-2
    h-screen
    bg-gray-900
    `}>
        <GymIcon/>
        <div className='
        flex
        flex-col
        justify-start
        h-full
        gap-2
        w-full
        
        '>
            <IconDescBtn sb icon={LayoutDashboard} label='Dashboard' onClick={()=>dispatch(dashboardOn())}/>
            <IconDescBtn sb icon={Users} label='Members' onClick={()=>dispatch(membersOn())}/>
            <IconDescBtn sb icon={CreditCard} label='Payment'/>
            <IconDescBtn sb icon={ChartColumn} label='Report'/>

        </div>
        <div className='
        flex
        flex-col
        justify-center
        gap-2
        w-full
        '>
            <IconDescBtn sb icon={Bell} label='Notifications'/>
            <IconDescBtn sb icon={Settings} label='Settings'/>
            <IconDescBtn sb icon={LogOut} label='Logout'/>
        </div>

    </div>
  )
}

export default SideBar