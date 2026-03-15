import React, { useEffect, useState } from 'react'
import IconDescBtn from '../components/IconDescBtn'
import { Check, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import axios from '../axios_simple'

function MemberAccess() {
    const {token} = useParams()
    const [enabled, setEnabled] = useState(false);
    const [memberDetails,setMemberDetails] = useState()
    const markAttendance = () => {
        const today = new Date().toISOString();
        axios.post(`members/member-access/${token}/markattendance`,{
            date:today
        })
        setEnabled(true)
    }
    useEffect(()=>{
        axios.get(`members/member-access/${token}`).then((res)=>{
            console.log(res.data)
            setMemberDetails(res.data)
        })
        axios.get(`members/member-access/${token}/getattendance`).then((res)=>{
            res.data.length===0 ?
            console.log(res.data) : 
            setEnabled(true)
        })
    },[])
    return (
        <div className='fixed
        flex
        flex-col
        justify-center
        items-center
        font-sans-serif
        bg-gray-950
        text-white
        inset-0
        w-full
        gap-4
        '>
            {memberDetails?
            <div className="flex flex-col">
                <div className="flex gap-10">
                    <h1 className='font-extrabold'>Name:</h1>
                    <h1>{memberDetails.member_name}</h1>
                </div>
                <div className="flex gap-10">
                    <h1 className='font-extrabold'>Ph no:</h1>
                    <h1>{memberDetails.member_phno}</h1>
                </div>
            </div>
            :""}
            <IconDescBtn icon={enabled ? Check : Plus}  label={enabled?'Attendance Marked for today':'Mark Attendance'}
            onClick={()=>enabled?'':markAttendance()}
            />
        </div>
  )
}

export default MemberAccess