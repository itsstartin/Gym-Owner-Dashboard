import React, { useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import MemberCard from '../components/MemberCard'
import MemberSearchBar from '../components/MemberSearchBar'
import getMembers from '../hooks/getMembers'

function MemberMenuContent() {
  const [members, setMembers]=useState([])
  useEffect(()=>{
    getMembers().then((response)=>{
      console.log(response.data[0])
      setMembers(response.data)
    })
  },[])
  return (
    <div className='
    flex
    flex-col
    w-full
    h-full
    gap-4
    p-3
    sm:p-6
    '>
        <WelcomeHeader/>
        <MemberSearchBar/>
        <div className='
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-4
        
        '>
            { members.map((obj)=>{
              console.log(obj.name)
              return <MemberCard name={obj.name}/>
            })}
            

        </div>

    </div>
  )
}

export default MemberMenuContent