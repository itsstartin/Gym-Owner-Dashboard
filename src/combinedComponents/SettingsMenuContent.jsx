import React, { useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import SettingsPersonalDetailsCard from '../components/SettingsPersonalDetailsCard'
import axios from '../axios'

function SettingsMenuContent() {
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
    gap-10
    p-3
    sm:p-6
    '>
        <WelcomeHeader header='Settings' desc='System configuration and preferences'/>
        <div className='flex
        flex-col
        w-full
        gap-8'
        >
          <SettingsPersonalDetailsCard title='Username' desc={userDetails.username}/>
          <SettingsPersonalDetailsCard title='Email' desc={userDetails.email}/>
        </div>

        

    </div>
  )
}

export default SettingsMenuContent