import React, { useEffect, useState } from 'react'
import axios from '../axios'

function SettingsPersonalDetailsCard(props) {
  const [edit,setEdit] = useState(false)
  const [descValue,setDescValue] = useState(props.desc)
  useEffect(()=>{
    setDescValue(props.desc)
  },[props.desc])
  const handleSave =async ()=> {
    try{
        await axios.post("members/update-user-email",{"email":descValue})
        setEdit(false)
        console.log("EMAIL UPDATED") 
    }
    catch(err){
      const errorMessage = err.response?.data?.error || "Something went wrong"
      console.error(err);
      setEdit(false)
      alert(errorMessage)
    }
  }
  return (
    <div className='
    flex
    justify-between
    outline-1
    outline-gray-900
    rounded-md
    p-5
    pr-1
    sm:pr-5
    '>
        <div className='grid md:grid-cols-5 grid-cols-10 w-full'>
        <h1 className='font-extrabold text-start w-full md:col-span-1 col-span-3  '>{props.title}</h1>
        {edit ? 
        <input type="email" className='text-start w-full outline-1 outline-gray-700 rounded-md p-1' value={descValue} onChange={
          (e)=>setDescValue(e.target.value)
        }></input>
        :
        <p className='text-start w-full'>{descValue}</p>
        }
        </div>
        {props.edit ? 
          
            edit ? 
              <button className='outline-1 p-0.5   rounded-md bg-green-700' onClick={()=>handleSave()}>Done</button>
              :  
              <button className='outline-1 p-0.5 rounded-md' onClick={()=>setEdit(true)}>Edit</button>
            
          
          :
          ''
          }
    </div>
  )
}

export default SettingsPersonalDetailsCard