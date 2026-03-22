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
  const [filterValue, setFilterValue] = useState({
    search: '',
    status: '',
    type: '',
  })
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
  const filteredMembers = members.filter((obj)=>{
    return obj.name.toLowerCase().includes(filterValue.search.toLowerCase()) && (filterValue.status==='' || obj.status===filterValue.status) && (filterValue.type==='' || obj.membership_plan.name===filterValue.type)
  })
    return (
    <div className='
    flex
    flex-col 
    w-full
    min-h-screen
    max-h-fit
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
        <MemberSearchBar filterValue={filterValue} setFilterValue={setFilterValue}/>
        <div className='
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-4
        
        '>
            {
            filteredMembers.length>0 ?
            filteredMembers.map((obj)=>{
              return <MemberCard member={obj}/>
            })
            :
            <div className='
            col-span-1
            flex
            flex-col
            justify-center
            items-center
            gap-2
            '>
              <h1 className='text-white text-2xl font-bold'>No members found</h1>
              <p className='text-gray-400 text-sm'>Please try again with different filters or search</p>
            </div>
            }
        </div>

    </div>
  )
}

export default MemberMenuContent