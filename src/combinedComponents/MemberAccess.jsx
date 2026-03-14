import React, { useEffect, useState } from 'react'
import IconDescBtn from '../components/IconDescBtn'
import { Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import axios from '../axios_simple'

function MemberAccess() {
    const {token} = useParams()
    const [memberDetails,setMemberDetails] = useState()
    useEffect(()=>{
        axios.get(`members/member-access/${token}`).then((res)=>{
            console.log(res.data)
            setMemberDetails(res.data)
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
            <IconDescBtn icon={Plus}  label='Mark Attendance'/>
            <IconDescBtn icon={Plus} label='Add Payment'/>
        </div>
  )
}

export default MemberAccess