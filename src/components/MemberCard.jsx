import React, { useState } from 'react'
import MemberTag from './MemberTag'
import axios from '../axios';
import { useSelector } from 'react-redux';
import Switch from '@mui/material/Switch';
import MemberViewProfile from './MemberViewProfile';
import UpdateMemberForm from './UpdateMemberForm';
import MemberHistoryModal from './MemberHistoryModal';
import { CalendarDays, Eye, Pencil, ReceiptIndianRupee, User} from 'lucide-react';
import { useRoleAccess } from '../features/roleAccess';

function MemberCard(props) {
    const attendanceMarked = Boolean(props.member.has_attendance_today);
    const health = props.member.health
    const healthColor = health?.score >= 80
      ? 'border-green-900 bg-green-950/40 text-green-400'
      : health?.score >= 60
        ? 'border-amber-900 bg-amber-950/30 text-amber-300'
        : 'border-red-900 bg-red-950/30 text-red-300'
    const [viewProfile,setViewProfile] = useState()
    const [updateMember,setUpdateMember] = useState()
    const [historyType, setHistoryType] = useState()
    const markAttendanceState = useSelector((state)=>state.markAttendanceState.value)
    const { manageMembers, manageAttendance, viewPaymentDetails } = useRoleAccess()
    const markAttendance = () => {
        const today = new Date().toISOString();
        axios.post('members/markattendance',{
            member:props.member.id,
            date:today
        }).then(()=>{
            props.onAttendanceChanged(props.member.id, true)
        }).catch(()=>undefined)
    }
    const deleteAttendance = () => {
        axios.delete(`members/deleteattendance/${props.member.id}`).then(()=>{
            props.onAttendanceChanged(props.member.id, false)
        }).catch(()=>undefined)
    }
  return (
    <>
    <div className='
    flex
    flex-col
    bg-gray-900
    text-white
    rounded-xl
    h-fit
    gap-4
    p-4
    border
    border-gray-800
    shadow-sm
    shadow-black/20
    transition-colors
    hover:border-green-900
    '>
        <div className='
        flex
        gap-3
        '>
            
            <div className='shrink-0 rounded-lg bg-gray-800 p-2 text-green-500'><User size={22}/></div>
            <div className='
            flex
            flex-col
            min-w-0
            flex-1
            '>  
                <h1 className='truncate font-semibold'>{props.member.name}</h1>
                <p className='truncate text-sm text-gray-400'>{props.member.email}</p>
            </div>
            <div className='flex shrink-0 items-start gap-1'>
              <button type='button' aria-label='Attendance history' title='Attendance history' className='rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white' onClick={()=>setHistoryType('attendance')}>
                <CalendarDays size={18}/>
              </button>
              {viewPaymentDetails && <button type='button' aria-label='Payment history' title='Payment history' className='rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white' onClick={()=>setHistoryType('payment')}>
                <ReceiptIndianRupee size={18}/>
              </button>}
              {manageAttendance && markAttendanceState ?
              <Switch
                checked={attendanceMarked}
                onChange={attendanceMarked ? deleteAttendance : markAttendance}
                />
              :
              ''
              }
            </div>
        </div>
        <div className='
        flex
        justify-start
        items-center
        gap-2
        '>
            <MemberTag plan={props.member.membership_plan.name}/>
            <MemberTag status={props.member.status}/>
        </div>
        {health && <div className={'rounded-lg border p-3 ' + healthColor}>
            <div className='flex items-center justify-between gap-3'>
                <div>
                    <p className='text-xs font-medium uppercase tracking-wide text-gray-400'>Member Health</p>
                    <p className='mt-1 text-sm font-semibold'>{health.label}</p>
                </div>
                <span className='text-lg font-bold'>{health.score}/100</span>
            </div>
            <p className='mt-2 text-xs text-gray-300'>{health.reasons?.[0]}</p>
        </div>}
        <div className='
        flex
        items-center
        '>
            <p className='text-sm text-gray-400'>Joined</p>
            <div className='
            flex
            justify-end
            w-full
            '>
                <p className='text-sm'>{new Date(props.member.membership_start_date).toLocaleDateString()}</p>
            </div>

        </div>
        <div className='
        flex
        items-center
        '>
            <p className='text-sm text-gray-400'>Phone</p>
            <div className='
            flex
            justify-end
            w-full
            '>
            <p className='text-sm'>{props.member.phone_number}</p>
            </div>
        </div>
        <div className='
        grid
        grid-cols-2
        gap-2
        '>
            <button
            type='button'
            className='
            flex
            justify-center
            w-full
            items-center
            bg-gray-800
            gap-2
            rounded-lg
            py-2
            text-sm
            font-medium
            hover:bg-gray-700
            '
            onClick={()=>setViewProfile(props.member)}
            >
                <Eye size={18}/>
                <h1>View</h1>
            </button>
            {manageMembers && <button
            type='button'
            className='
            flex
            justify-center
            w-full
            items-center
            bg-gray-800
            gap-2
            rounded-lg
            py-2
            text-sm
            font-medium
            hover:bg-gray-700
            '
            onClick={()=>setUpdateMember(props.member)}
            >
                <Pencil size={18}/>
                <h1>Update</h1>
            </button>}
        </div>
    </div>
    {viewProfile ? 
    <MemberViewProfile viewProfile={viewProfile} setViewProfile={setViewProfile}/>
    :''}
    {updateMember ? 
    <UpdateMemberForm member={updateMember} onClose={()=>setUpdateMember()} onUpdated={props.onMemberUpdated}/>
    :''}
    {historyType ?
    <MemberHistoryModal member={props.member} type={historyType} onClose={()=>setHistoryType()}/>
    :''}
    </>
  )
}

export default MemberCard
