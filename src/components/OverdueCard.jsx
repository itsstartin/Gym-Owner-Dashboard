import React from 'react'

function OverdueCard(props) {
  return (
    <div className="flex flex-col outline-1 outline-gray-700 rounded-[8px] p-2 bg-gray-900">
        <div className='flex justify-between'>
            <h1>{props.obj.name}</h1>
            <p>₹ {props.obj.overdue_amount}</p>
        </div>
        <div className='flex justify-between'>
            <h1>{props.obj.membership_plan}</h1>
            <div className='bg-red-600 p-0.5 rounded-lg'>
                <h1>{`${props.obj.overdue_days} days overdue`}</h1>
            </div>
        </div>
    </div>
  )
}

export default OverdueCard