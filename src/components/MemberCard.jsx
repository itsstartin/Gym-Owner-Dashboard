import React, { useEffect, useState } from 'react'
import MemberStatus from './MemberStatus'
import axios from '../axios';
import { useSelector } from 'react-redux';
import Switch from '@mui/material/Switch';
import { Check } from 'lucide-react';
function MemberCard(props) {
    const [enabled, setEnabled] = useState(false);
    const markAttendanceState = useSelector((state)=>state.markAttendanceState.value)
    useEffect(()=>{
        axios.get(`members/getattendance/${props.member.id}`).then((res)=>{
            res.data.length===0 ?
            console.log(res.data) : 
            setEnabled(true)
        })
    },[markAttendanceState]) 
    const markAttendance = () => {
        const today = new Date().toISOString().split('T')[0];
        axios.post('members/markattendance',{
            member:props.member.id,
            date:today
        })
        setEnabled(true)
    }
    const deleteAttendance = () => {
        axios.delete(`members/deleteattendance/${props.member.id}`).then((res)=>{
            console.log(res.data)
            setEnabled(false)
        }).catch((err)=>{
            console.log(err)
        })
    }
  return (
    <div className='
    flex
    flex-col
    bg-gray-900
    text-white
    rounded-[8px]
    gap-2
    p-2
    '>
        <div className='
        flex
        gap-2
        '>
            <img className='
            w-10
            h-10
            '>
            </img>
            <div className='
            flex
            flex-col
            w-full
            '>  
                <h1>{props.member.name}</h1>
                <p>{props.member.email}</p>
            </div>
            {markAttendanceState ?
            <Switch
              checked={enabled}
              onChange={enabled ? deleteAttendance : markAttendance}
              />
            :
            ''
            }
        </div>
        <div className='
        flex
        justify-start
        items-center
        gap-2
        '>
            <MemberStatus/>
        </div>
        <div className='
        flex
        items-center
        '>
            <p>Joined:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
                <p>{new Date(props.member.created_at).toLocaleDateString()}</p>
            </div>

        </div>
        <div className='
        flex
        items-center
        '>
            <p>Phone:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
            <p>{props.member.phone_number}</p>
            </div>
        </div>
        <div className='
        flex
        justify-center
        w-full
        items-center
        bg-black
        gap-2
        rounded-[8px]
        '>
            <img className='
            w-6
            h-6
            '>
            </img>
            <h1>View Profile</h1>
        </div>

    </div>
  )
}

export default MemberCard