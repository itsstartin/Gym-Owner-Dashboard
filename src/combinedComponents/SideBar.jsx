import React from 'react'
import GymIcon from '../components/GymIcon'
import IconDescBtn from '../components/IconDescBtn'
import { useSelector } from 'react-redux'
import { Bell, ChartColumn, CreditCard, LayoutDashboard, LayoutDashboardIcon, LogOut, LucideLayoutDashboard, Settings, Users } from 'lucide-react';

function SideBar() {
  const sidebarState = useSelector((state)=>state.sidebarState.value)

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
    items-center
    w-44
    p-3.5
    h-screen
    bg-gray-800
    `}>
        <GymIcon/>
        <div className='
        flex
        flex-col
        justify-start
        h-full
        gap-2
        
        '>
            <IconDescBtn icon={LayoutDashboard} label='Dashboard'/>
            <IconDescBtn icon={Users} label='Members'/>
            <IconDescBtn icon={CreditCard} label='Payment'/>
            <IconDescBtn icon={ChartColumn} label='Report'/>

        </div>
        <div className='
        flex
        flex-col
        justify-center
        items-center
        gap-2
        
        '>
            <IconDescBtn icon={Bell} label='Notifications'/>
            <IconDescBtn icon={Settings} label='Settings'/>
            <IconDescBtn icon={LogOut} label='Logout'/>

        </div>

    </div>
  )
}

export default SideBar