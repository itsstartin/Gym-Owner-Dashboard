import React, { useEffect, useState } from 'react'
import MemberStatus from './MemberStatus'
import axios from '../axios';

function MemberCard(props) {
    const [enabled, setEnabled] = useState(false);
    useEffect(()=>{
        axios.get(`members/getattendance/${props.member.id}`).then((res)=>{
            res.data.length===0 ?
            console.log(res.data) : 
            setEnabled(true)
        })
    },[]) 
    const markAttendance = () => {
        const today = new Date().toISOString().split('T')[0];
        axios.post('members/markattendance',{
            member:props.member.id,
            date:today
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
            <button
            onClick={() => markAttendance()}
            className={`${
            enabled ? 'bg-indigo-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
            <span className="sr-only">Enable setting</span>
            <span
            className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`}
            />
            </button>
            <span className="ml-3 text-sm font-medium text-gray-900">
            {enabled ? 'Active' : 'Paused'}
            </span>

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