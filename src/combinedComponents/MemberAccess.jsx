import React, { useEffect, useState } from 'react'
import IconDescBtn from '../components/IconDescBtn'
import { Check, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import axios from '../axios_simple'

function MemberAccess() {
    const {token} = useParams()
    const [enabled, setEnabled] = useState(false);
    const [memberDetails,setMemberDetails] = useState()
    const [error, setError] = useState('')
    const markAttendance = () => {
        const today = new Date().toISOString();
        axios.post(`members/member-access/${token}/markattendance`, { date: today })
            .then(() => setEnabled(true))
            .catch((requestError) => setError(requestError.response?.data?.error || 'Could not mark attendance.'))
    }
    useEffect(()=>{
        axios.get(`members/member-access/${token}`).then((res) => {
            setMemberDetails(res.data)
            setError('')
        }).catch((requestError) => setError(requestError.response?.data?.error || 'This attendance link is unavailable.'))
        axios.get(`members/member-access/${token}/getattendance`).then((res) => {
            setEnabled(res.data.attendance_marked)
        }).catch((requestError) => setError(requestError.response?.data?.error || 'This attendance link is unavailable.'))
    },[token])
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
        min-h-screen
        max-h-fit
        gap-4
        '>
            {memberDetails?
            <div className="flex flex-col">
                <div className="flex gap-10">
                    <h1 className='font-extrabold'>Name:</h1>
                    <h1>{memberDetails.member_name}</h1>
                </div>
            </div>
            :""}
            {error && <p role="alert" className="text-red-300">{error}</p>}
            <IconDescBtn icon={enabled ? Check : Plus}  label={enabled?'Attendance Marked for today':'Mark Attendance'}
            onClick={()=>enabled?'':markAttendance()}
            />
        </div>
  )
}

export default MemberAccess