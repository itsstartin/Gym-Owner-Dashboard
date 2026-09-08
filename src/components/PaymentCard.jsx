import React, { useEffect, useState } from 'react'
import axios from '../axios'

function PaymentCard(props) {
  const [memberData,setMemberData]=useState({})
  const [planData,setPlanData]=useState({})
  useEffect(()=>{
    const member = props.data.member
     axios.get(`members/get/${member}`).then((res)=>{
      setMemberData(res.data)
      setPlanData(res.data.membership_plan)
    })
  },[props.data.member])
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-800 bg-gray-950 p-3 transition-colors hover:border-green-900">
        <div className='flex justify-between'>
            <h1 className='font-medium'>{memberData.name}</h1>
            <p className='font-semibold text-green-500'>₹ {props.data.amount}</p>
        </div>
        <div className='flex justify-start'>
            <h1 className='text-sm text-gray-400'>{planData.name}</h1>
        </div>
        <div className='flex justify-between'>
            <h1 className='text-xs uppercase tracking-wide text-gray-500'>{props.data.payment_type}</h1>
            <h1 className='text-xs text-gray-500'>{new Date(props.data.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</h1>
        </div>
    </div>
  )
}

export default PaymentCard
