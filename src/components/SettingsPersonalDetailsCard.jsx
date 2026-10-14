import React, { useState } from 'react'
import axios from '../axios'

function SettingsPersonalDetailsCard(props) {
  const [edit,setEdit] = useState(false)
  const [descValue,setDescValue] = useState(props.desc)
  const handleSave =async ()=> {
    try{
        await axios.post("members/update-user-email",{"email":descValue})
        setEdit(false)
    }
    catch(err){
      const errorMessage = err.response?.data?.error || "Something went wrong"
      setEdit(false)
      alert(errorMessage)
    }
  }
  return (
    <div className='
    flex
    justify-between
    items-center
    border
    border-gray-800
    bg-gray-900/70
    rounded-xl
    p-4
    '>
        <div className='grid md:grid-cols-5 grid-cols-10 w-full'>
        <h1 className='font-semibold text-start w-full text-gray-300 md:col-span-1 col-span-3'>{props.title}</h1>
        {edit ? 
        <input type="email" className='text-start w-full outline-1 outline-gray-700 rounded-md p-1' value={descValue} onChange={
          (e)=>setDescValue(e.target.value)
        }></input>
        :
        <p className='text-start w-full text-sm'>{descValue}</p>
        }
        </div>
        {props.edit ? 
          
            edit ? 
              <button className='rounded-lg bg-green-700 px-3 py-1.5 text-sm font-semibold hover:bg-green-600' onClick={()=>handleSave()}>Done</button>
              :  
              <button className='rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-semibold hover:bg-gray-800' onClick={()=>{setDescValue(props.desc); setEdit(true)}}>Edit</button>
            
          
          :
          ''
          }
    </div>
  )
}

export default SettingsPersonalDetailsCard
