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
    grid
    grid-cols-3
    place-items-center
    outline-1
    outline-gray-900
    rounded-md
    p-5
    '>
        <h1 className='font-extrabold text-start w-full'>{props.title}</h1>
        {edit ? 
        <input type="email" className='text-start w-full outline-1 outline-gray-700 rounded-md p-1' value={descValue} onChange={
          (e)=>setDescValue(e.target.value)
        }></input>
        :
        <p className='text-start w-full'>{descValue}</p>
        }
        {props.edit ? 
          <div className='flex justify-end p-2 w-full '>
            {edit ? 
              <button className='outline-1 p-0.5 rounded-md bg-green-700' onClick={()=>handleSave()}>Done</button>
              :  
              <button className='outline-1 p-0.5 rounded-md' onClick={()=>setEdit(true)}>Edit</button>
            }
          </div>
          :
          ''
          }
    </div>
  )
}

export default SettingsPersonalDetailsCard