import React, { useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import MemberCard from '../components/MemberCard'
import MemberSearchBar from '../components/MemberSearchBar'
import getMembers from '../hooks/getMembers'
import { Check, Plus } from 'lucide-react'
import IconDescBtn from '../components/IconDescBtn'
import { useDispatch, useSelector } from 'react-redux'
import { markAttendanceOff, markAttendanceOn } from '../features/markAttendanceSlice'

function MemberMenuContent() {
  const markAttendanceState = useSelector((state)=>state.markAttendanceState.value)
  const dispatch = useDispatch()
  const [members, setMembers]=useState([])
  useEffect(()=>{
    getMembers().then((response)=>{
      setMembers(response.data)
    })
    return ()=>{
      dispatch(markAttendanceOff())
    }
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
         <div className='
          grid
          grid-cols-2
  
          '>
              <WelcomeHeader/>
              <div className='
              col-span-1
              flex
              justify-end
              items-center
              '>
                  <IconDescBtn icon={markAttendanceState ? Check : Plus} label={markAttendanceState ? 'Done' : 'Mark Attendance'} 
                  onClick={()=>{
                    markAttendanceState ?
                    dispatch(markAttendanceOff()) :
                    dispatch(markAttendanceOn())
                  }} /> 
              </div>
  
          </div>
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
              return <MemberCard member={obj}/>
            })}
            

        </div>

    </div>
  )
}

export default MemberMenuContent