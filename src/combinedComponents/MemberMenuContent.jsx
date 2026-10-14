import React, { useCallback, useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import MemberCard from '../components/MemberCard'
import MemberSearchBar from '../components/MemberSearchBar'
import getMembers from '../hooks/getMembers'
import { Check, Plus } from 'lucide-react'
import IconDescBtn from '../components/IconDescBtn'
import { useDispatch, useSelector } from 'react-redux'
import { markAttendanceOff, markAttendanceOn } from '../features/markAttendanceSlice'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState'

function MemberMenuContent() {
  const [filterValue, setFilterValue] = useState({
    search: '',
    status: '',
    type: '',
    health: '',
  })
  const markAttendanceState = useSelector((state)=>state.markAttendanceState.value)
  const dispatch = useDispatch()
  const [members, setMembers]=useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshMembers = useCallback(async ()=>{
    setIsLoading(true)
    setError('')
    try {
      const response = await getMembers()
      setMembers(response.data)
    } catch {
      setError('Unable to load members. Please try again.')
    } finally {
      setIsLoading(false)
    }
  },[])

  const updateMemberAttendance = useCallback((memberId, hasAttendanceToday)=>{
    setMembers((currentMembers)=>currentMembers.map((member)=>
      member.id === memberId
        ? { ...member, has_attendance_today: hasAttendanceToday }
        : member
    ))
  },[])

  useEffect(()=>{
    refreshMembers()
    return ()=>{
      dispatch(markAttendanceOff())
    }
  },[dispatch, refreshMembers])

  const filteredMembers = members.filter((obj)=>{
    return obj.name.toLowerCase().includes(filterValue.search.toLowerCase()) && (filterValue.status==='' || obj.status===filterValue.status) && (filterValue.type==='' || obj.membership_plan.name===filterValue.type) && (filterValue.health === '' || obj.health?.is_at_risk)
  })

  const emptyTitle = members.length === 0 ? 'No members yet' : 'No matching members'
  const emptyMessage = members.length === 0
    ? 'Add your first member to start managing your gym.'
    : 'Try changing your search or filters.'

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
         <div className='
          grid
          grid-cols-1
          sm:grid-cols-2
          '>
              <WelcomeHeader header="Member Management" desc="Manage your members and their details" />
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
        {isLoading ? <LoadingState message="Loading members..." /> : error ? <ErrorState message={error} onRetry={refreshMembers} /> :
        <div className='
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-5
        overflow-y-auto
        pb-8
        content-start
        '>
            {filteredMembers.length > 0
              ? filteredMembers.map((obj)=>(
                <MemberCard
                  member={obj}
                  key={obj.id}
                  onMemberUpdated={refreshMembers}
                  onAttendanceChanged={updateMemberAttendance}
                />
              ))
              : <div className='col-span-full'><EmptyState title={emptyTitle} message={emptyMessage} /></div>
            }
        </div>
        }
    </div>
  )
}

export default MemberMenuContent
