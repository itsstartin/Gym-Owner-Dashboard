import React, { useState } from 'react'
import IconDescBtn from './IconDescBtn'
import axios from '../axios'

function AddMemberForm() {
    const [memberForm,setMemberForm]=useState({
        'name':"",
        'email':"",
        'phone_number':""
    })
    const handleChange = (e)=>{
        e.preventDefault();
        const {name , value} = e.target;
        setMemberForm((prev)=>({
            ...prev,
            [name] : value
        }));
    }
    const handleSubmit= async (e)=>{
        e.preventDefault();
        try{
            const response = await axios.post('members/create',memberForm)
            console.log("Saved",response.data)
            setMemberForm({
                'name':"",
                'email':"",
                'phone_number':""
            
            })
            alert("Member Added successfully")

        }catch(error){
            console.error(error)
            alert("Error saving data")
        }
        
    }

  return (
    <div className='
    fixed
    inset-0
    flex
    items-center
    justify-center
    bg-white/40
    '>
    
    <form onSubmit={handleSubmit} className='
    flex
    flex-col
    gap-2
    justify-center
    items-start
    bg-gray-950
    text-white
    p-4
    rounded-[8px]
    '>
        <h1>Add New Member</h1>
        <p>Create a new member profile and assign membership type</p>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <h1>Full Name</h1>
            <input name='name' type='text' placeholder='First Name' onChange={(e)=>handleChange(e)}
            value={memberForm.name}>
            </input>
        </div>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <h1>Email</h1>
            <input name='email' type='email' placeholder='Email' onChange={(e)=>handleChange(e)} 
            value={memberForm.email}>
            </input>
        </div>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <h1>Phone Number</h1>
            <input name='phone_number' type='number' placeholder='Phone Number'onChange={(e)=>handleChange(e)} 
            value={memberForm.phone_number}>
            </input>
        </div>
        <div className="
        flex
        justify-end
        w-full
        ">
            <IconDescBtn label='Cancel'/>
            <IconDescBtn type="submit" label='Create Member'/>
        </div> 
    </form>
    </div>
  )
}

export default AddMemberForm