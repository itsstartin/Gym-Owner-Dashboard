import React, { useEffect, useState } from 'react'
import IconDescBtn from './IconDescBtn'
import axios from '../axios'
import { useDispatch } from 'react-redux'
import { dashboardOn } from '../features/currentPageSlice'


function AddMemberForm() {
    const dispatch = useDispatch()
    const [memberForm,setMemberForm]=useState({
        'name':"",
        'email':"",
        'phone_number':"",
        'membership_plan_id':"",
        'membership_start_date':"",
    })
    const handleChange = (e)=>{
        const {name , value} = e.target;
        setMemberForm((prev)=>({
            ...prev,
            [name] : value
        }));
    }
    const handleSubmit= async (e)=>{
        e.preventDefault();
        try{
            await axios.post('members/create',memberForm)
            setMemberForm({
                'name':"",
                'email':"",
                'phone_number':"",
                'membership_plan_id':"",
                'membership_start_date':"",
            
            })
            alert("Member Added successfully")

        }catch {
            alert("Error saving data")
        }
        
    }
    const [plans,setPlans]=useState([])
    useEffect(()=>{
        axios.get('/members/getplans').then((res)=>{
            setPlans(res.data)
            
        })
    },[])

  return (
    <div className='
    fixed
    inset-0
    z-40
    flex
    items-center
    justify-center
    bg-black/70
    p-4
    backdrop-blur-sm
    '>
    
    <form onSubmit={handleSubmit} className='
    flex
    flex-col
    w-full
    max-w-lg
    gap-4
    bg-gray-900
    text-white
    p-5
    rounded-xl
    border
    border-gray-800
    shadow-2xl
    '>
        <div><h1 className='text-xl font-bold'>Add New Member</h1><p className='mt-1 text-sm text-gray-400'>Create a profile and assign a membership plan.</p></div>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <label className='mb-1 text-sm font-medium text-gray-300'>Full Name</label>
            <input name='name' type='text' placeholder='First Name' onChange={(e)=>handleChange(e)}
            value={memberForm.name} required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-green-600'>
            </input>
        </div>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <label className='mb-1 text-sm font-medium text-gray-300'>Email</label>
            <input name='email' type='email' placeholder='Email' onChange={(e)=>handleChange(e)} 
            value={memberForm.email} required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-green-600'>
            </input>
        </div>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <label className='mb-1 text-sm font-medium text-gray-300'>Phone Number</label>
            <input name='phone_number' type='number' placeholder='Phone Number'onChange={(e)=>handleChange(e)} 
            value={memberForm.phone_number} required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-green-600'>
            </input>
        </div>
        <label className='flex w-full flex-col gap-1 text-sm font-medium text-gray-300'>Membership Plan
        <select value={memberForm.membership_plan_id} name='membership_plan_id' required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm font-normal outline-none focus:border-green-600' onChange={(e)=>handleChange(e)}>
            <option value=''>Select Plan</option>
            {plans ? 
            plans.map((obj)=>{
                return <option value={obj.id} key={obj.id}>{obj.name} - {obj.plan_price}</option>
            })
            :''}
        </select></label>
        <div className='w-full'>
            <label className='mb-1 block text-sm font-medium text-gray-300'>Membership Start Date</label>
            <input type='date' value={memberForm.membership_start_date}
             name='membership_start_date' required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-green-600' onChange={(e)=>handleChange(e)}>
            </input>
        </div>
        
        <div className="
        flex
        justify-end
        w-full
        gap-2
        ">
            <IconDescBtn label="Cancel" onClick={()=>dispatch(dashboardOn())}/>
            <IconDescBtn type="submit" label='Create Member'/>
        </div> 
    </form>
    </div>
  )
}

export default AddMemberForm
