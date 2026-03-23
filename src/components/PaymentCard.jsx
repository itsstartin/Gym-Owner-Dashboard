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
  },[])
  return (
    <div className="flex flex-col   rounded-[8px] p-2 bg-gray-900
    outline-1
    outline-gray-800
    hover:outline-green-800">
        <div className='flex justify-between'>
            <h1>{memberData.name}</h1>
            <p>₹ {props.data.amount}</p>
        </div>
        <div className='flex justify-start'>
            <h1>{planData.name}</h1>
        </div>
        <div className='flex justify-between'>
            <h1>{props.data.payment_type}</h1>
            <h1>{new Date(props.data.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</h1>
        </div>
    </div>
  )
}

export default PaymentCard