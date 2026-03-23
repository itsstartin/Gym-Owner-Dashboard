import React from 'react'
import MemberTag from './MemberTag'
import { User, X } from 'lucide-react'

function MemberViewProfile({viewProfile, setViewProfile}) {
  return (
    <div className='fixed
    flex
    justify-center
    items-center
    bg-black/70
    inset-0
    '>
    <div className='
    flex
    flex-col
    bg-gray-900
    text-white
    rounded-[8px]
    gap-2
    p-2
    outline-1
    outline-gray-800
    '>
        <div className='
        flex
        gap-2
        '>
            <User size={40}/>
            <div className='
            flex
            flex-col
            w-full
            '>  
                <h1>{viewProfile.name}</h1>
                <p>{viewProfile.email}</p>
            </div>
            <X onClick={()=>setViewProfile()}/>
        </div>
        <div className='
        flex
        justify-start
        items-center
        gap-2
        '>
            <MemberTag plan={viewProfile.membership_plan.name}/>
            <MemberTag status={viewProfile.status}/>
            {viewProfile.overdue_days > 0 &&
             <div className='bg-red-600 p-0.5 rounded-lg'>
                <h1>{`${viewProfile.overdue_days} days overdue`}</h1>
            </div>
            }
        </div>
        <div className='
        flex
        items-center
        '>
            <p>Phone:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
            <p>{viewProfile.phone_number}</p>
            </div>
        </div>
        <div className='
        flex
        items-center
        '>
            <p>Total Paid Amount:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
            <p>{viewProfile.total_cash_paid}</p>
            </div>
        </div>
        <div className='
        flex
        items-center
        '>
            <p>Membership Start Date:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
                <p>{new Date(viewProfile.membership_start_date).toLocaleDateString()}</p>
            </div>
        </div>
        <div className='
        flex
        items-center
        '>
            <p>Membership End Date:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
                <p>{new Date(viewProfile.membership_end_date).toLocaleDateString()}</p>
            </div>
        </div>
        <div className='
        flex
        items-center
        '>
            {
                viewProfile.status==='expired' &&

                <>
                     <p>Overdue Amount:</p>
                    <div className='
                    flex
                    justify-end
                    w-full
                    '>
                        <p>{viewProfile.overdue_amount}</p>
                    </div>
                </>
            }
        </div>
    </div>
    </div>
  )
}

export default MemberViewProfile