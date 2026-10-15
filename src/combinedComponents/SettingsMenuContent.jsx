import React, { useEffect, useRef, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import SettingsPersonalDetailsCard from '../components/SettingsPersonalDetailsCard'
import axios from '../axios'
import SettingsMemberSection from '../components/SettingsMemberSection'

function SettingsMenuContent({ isActive, dataVersion }) {
  const [currentSettingsPage,setCurrentSettingsPage] = useState('Profile')
  const [userDetails,setUserDetails]=useState({})
  const loadedDataVersion = useRef(dataVersion)
  useEffect(()=>{
    axios.get('members/user').then((res)=>{
      setUserDetails(res.data)
    })
  },[currentSettingsPage])

  useEffect(() => {
    if (!isActive || loadedDataVersion.current === dataVersion) return
    loadedDataVersion.current = dataVersion
    axios.get('members/user').then((res) => {
      setUserDetails(res.data)
    })
  }, [dataVersion, isActive])
  return (
    <div className='
    flex
    flex-col
    w-full
    min-h-screen
    max-h-fit
    gap-6
    p-4
    sm:p-6
    lg:p-8
    '>
        <WelcomeHeader header='Settings' desc='System configuration and preferences'/>
        <div className="flex w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-1">
          <button type='button' className={currentSettingsPage==='Profile' ? 'flex-1 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold shadow-sm':'flex-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white'}
          onClick={()=>setCurrentSettingsPage('Profile')}
          >Profile</button>
          <button type='button'
          className= {currentSettingsPage==='Members' ? 'flex-1 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold shadow-sm':'flex-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white'}
          onClick={()=>setCurrentSettingsPage('Members')}
          >Members</button>
        </div>
        {currentSettingsPage==='Profile'?
        <div className='flex
        flex-col
        w-full
        gap-2'
        >
          <SettingsPersonalDetailsCard title='Username' desc={userDetails.username}/>
          <SettingsPersonalDetailsCard title='Email' desc={userDetails.email} edit/>
        </div>
        :
        <SettingsMemberSection/>
        }
    </div>
  )
}

export default SettingsMenuContent
