import React, { useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import SettingsPersonalDetailsCard from '../components/SettingsPersonalDetailsCard'
import axios from '../axios'
import SettingsMemberSection from '../components/SettingsMemberSection'

function SettingsMenuContent() {
  const [currentSettingsPage,setCurrentSettingsPage] = useState('Profile')
  const [userDetails,setUserDetails]=useState({})
  useEffect(()=>{
    axios.get('members/user').then((res)=>{
      setUserDetails(res.data)
    })
  },[])
  return (
    <div className='
    flex
    flex-col
    w-full
    gap-6
    p-3
    sm:p-6
    '>
        <WelcomeHeader header='Settings' desc='System configuration and preferences'/>
        <div className="flex gap-8">
          <h1 className={currentSettingsPage==='Profile' ? 'bg-gray-800 rounded-lg pt-0.5 pb-0.5 p-3 font-semibold':'pt-0.5 pb-0.5 p-3 font-medium'}
          onClick={()=>setCurrentSettingsPage('Profile')}
          >Profile</h1>
          <h1 
          className= {currentSettingsPage==='Members' ? 'bg-gray-800 rounded-lg pt-0.5 pb-0.5 p-3 font-semibold':'pt-0.5 pb-0.5 p-3 font-medium'}
          onClick={()=>setCurrentSettingsPage('Members')}
          >Members</h1>
        </div>
        {currentSettingsPage==='Profile'?
        <div className='flex
        flex-col
        w-full
        gap-8'
        >
          <SettingsPersonalDetailsCard title='Username' desc={userDetails.username}/>
          <SettingsPersonalDetailsCard title='Email' desc={userDetails.email}/>
        </div>
        :
        <SettingsMemberSection/>
        }
    </div>
  )
}

export default SettingsMenuContent