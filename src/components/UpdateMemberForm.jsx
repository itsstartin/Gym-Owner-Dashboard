import React, { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'
import axios from '../axios'

function UpdateMemberForm({member, onClose, onUpdated}) {
  const [plans, setPlans] = useState([])
  const [memberForm, setMemberForm] = useState({
    email: member.email || '',
    phone_number: member.phone_number || '',
    membership_plan_id: member.membership_plan?.id || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const planLocked = member.status === 'expired'

  useEffect(()=>{
    axios.get('/members/getplans').then((res)=>{
      setPlans(res.data)
    })
  },[])

  const handleChange = (e)=>{
    const {name, value} = e.target
    setMemberForm((prev)=>({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      email: memberForm.email,
      phone_number: memberForm.phone_number,
    }

    if(!planLocked){
      payload.membership_plan_id = memberForm.membership_plan_id
    }

    try{
      await axios.patch(`members/update/${member.id}`, payload)
      await onUpdated()
      onClose()
      alert('Member updated successfully')
    }catch(error){
      console.error(error)
      alert(error.response?.data?.membership_plan_id || 'Error updating member')
    }finally{
      setIsSaving(false)
    }
  }

  return (
    <div className='
    fixed
    inset-0
    z-20
    flex
    items-center
    justify-center
    bg-black/70
    p-3
    '>
      <form onSubmit={handleSubmit} className='
      flex
      w-full
      max-w-sm
      flex-col
      gap-3
      rounded-[8px]
      bg-gray-950
      p-4
      text-white
      outline-1
      outline-gray-800
      '>
        <div className='flex items-start gap-2'>
          <div className='flex w-full flex-col'>
            <h1 className='text-lg font-bold'>{member.name}</h1>
          </div>
          <button type='button' onClick={onClose} className='rounded-[4px] p-1 hover:bg-gray-800'>
            <X size={18}/>
          </button>
        </div>

        <label className='flex flex-col gap-1 text-sm text-gray-300'>
          Email
          <input
            name='email'
            type='email'
            value={memberForm.email}
            onChange={handleChange}
            className='rounded-[4px] bg-gray-900 p-2 text-white outline-1 outline-gray-700'
          />
        </label>

        <label className='flex flex-col gap-1 text-sm text-gray-300'>
          Phone Number
          <input
            name='phone_number'
            type='tel'
            value={memberForm.phone_number}
            onChange={handleChange}
            className='rounded-[4px] bg-gray-900 p-2 text-white outline-1 outline-gray-700'
          />
        </label>

        <label className='flex flex-col gap-1 text-sm text-gray-300'>
          Member Plan
          <select
            value={memberForm.membership_plan_id}
            name='membership_plan_id'
            disabled={planLocked}
            onChange={handleChange}
            className='rounded-[4px] bg-gray-900 p-2 text-white outline-1 outline-gray-700 disabled:text-gray-500'
          >
            {plans.map((obj)=>{
              return <option value={obj.id} key={obj.id}>{obj.name} - {obj.plan_price}</option>
            })}
          </select>
        </label>

        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={onClose}
            className='flex items-center gap-2 rounded-[8px] bg-gray-800 px-3 py-2 text-sm font-bold hover:bg-gray-700'
          >
            <X size={16}/>
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSaving}
            className='flex items-center gap-2 rounded-[8px] bg-green-800 px-3 py-2 text-sm font-bold hover:bg-green-900 disabled:bg-gray-700'
          >
            <Save size={16}/>
            {isSaving ? 'Saving' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateMemberForm
