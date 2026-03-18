import React, { useEffect, useState } from 'react'
import axios from '../axios'
import {Send} from 'lucide-react'
import {ClipLoader} from 'react-spinners'

function SettingsMemberSection() {
    const [isLoading,setIsLoading]=useState(false)
    const [members,setMembers]=useState([])
    useEffect(()=>{
        axios.get('members/get').then((res)=>{
            setMembers(res.data)
        })
    },[])
    const [selectedMember,setSelectedMember]=useState({member_id:''})
    const handleChange = (e) => {
        e.preventDefault()
        setSelectedMember({member_id: e.target.value})
    }
    const handleSubmit = async(e) =>{
        e.preventDefault()
        setIsLoading(true)
        try{
            await axios.post('members/attendance-mail',selectedMember).then((res)=>{
                console.log(res.data)
            })
        }
        finally{
            setIsLoading(false)
            console.log("Sent")
        }
    }
  return (
    <div className='flex
    flex-col
    w-full
    gap-8'
    >
        <div className='flex w-full gap-4 outline-1 outline-gray-700 p-2 rounded-lg'>
            <div className="flex justify-start w-full gap-4">
                <h1 className='font-medium'>Send Attendance link to selected Members:</h1>
                <select name='member' onChange={(e)=>handleChange(e)}
                    className='rounded-lg bg-gray-900'
                    value={selectedMember.member_id}>
                        <option value=''>Select Member</option>
                        <option value='all'>All Members</option>
                        {members ? 
                        members.map((obj)=>{
                            return <option value={obj.id} key={obj.id}>{obj.name}</option>
                        })
                        :''}
                </select>
            </div>
            <div className="flex justify-end">
                {isLoading ?
                <ClipLoader size={20} color='#fff'/>
                :
                <Send onClick={selectedMember.member_id!=='' ? (e)=>handleSubmit(e) :()=>console.log('Select Valid Member')}/>
                }
            </div>
        </div>
    </div>
  )
}

export default SettingsMemberSection