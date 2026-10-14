import React from 'react'
import GymIcon from '../components/GymIcon'
import IconDescBtn from '../components/IconDescBtn'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, ChartColumn, CreditCard, LayoutDashboard,  LogOut,  Settings, Users } from 'lucide-react';
import { dashboardOn, membersOn, paymentsOn, reportsOn, logoutOn, settingsOn, notificationsOn } from '../features/currentPageSlice';
import { useRoleAccess } from '../features/roleAccess';

function SideBar() {
  const sidebarState = useSelector((state)=>state.sidebarState.value)
  const dispatch = useDispatch()
  const { dashboard, members, payments, reports, notifications, settings } = useRoleAccess()

  return (
    <div className={`
    flex
    flex-col
    self-start
    z-30
    fixed
    ${sidebarState ? 'translate-x-0' :'-translate-x-full'}
    md:sticky md:translate-x-0
    top-0
    justify-between
    min-w-60
    max-w-60
    p-3
    h-screen
    bg-gray-900/95
    border-r
    border-gray-800
    shadow-2xl
    transition-transform
    duration-200
    ease-out
    `}>
        <GymIcon/>
        <div className='
        flex
        flex-col
        justify-start
        h-full
        gap-1.5
        w-full


        '>
            {dashboard && <IconDescBtn sb icon={LayoutDashboard} label='Dashboard' onClick={()=>dispatch(dashboardOn())}/>}
            {members && <IconDescBtn sb icon={Users} label='Members' onClick={()=>dispatch(membersOn())}/>}
            {payments && <IconDescBtn sb icon={CreditCard} label='Payments' onClick={()=>dispatch(paymentsOn())}/>}
            {reports && <IconDescBtn sb icon={ChartColumn} label='Reports' onClick={()=>dispatch(reportsOn())}/>}

        </div>
        <div className='
        flex
        flex-col
        justify-center
        gap-1.5
        w-full
        '>
            {notifications && <IconDescBtn sb icon={Bell} label='Notifications' onClick={()=>dispatch(notificationsOn())}/>}
            {settings && <IconDescBtn sb icon={Settings} label='Settings' onClick={()=>dispatch(settingsOn())}/>}
            <IconDescBtn sb icon={LogOut} label='Logout' onClick={()=>dispatch(logoutOn())}/>
        </div>

    </div>
  )
}

export default SideBar
