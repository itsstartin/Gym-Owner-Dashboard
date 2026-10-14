import React from 'react'
import MemberTag from './MemberTag'
import { User, X } from 'lucide-react'
import { useRoleAccess } from '../features/roleAccess'

function MemberViewProfile({viewProfile, setViewProfile}) {
  const { viewPaymentDetails } = useRoleAccess()
  return (
    <div className='fixed
    z-40
    flex
    justify-center
    items-center
    bg-black/70
    inset-0
    p-4
    backdrop-blur-sm
    '>
    <div className='
    flex
    flex-col
    bg-gray-900
    text-white
    w-full
    max-w-md
    rounded-xl
    gap-4
    p-5
    border
    border-gray-800
    shadow-2xl
    '>
        <div className='
        flex
        gap-3
        '>
            <div className='rounded-lg bg-gray-800 p-2 text-green-500'><User size={24}/></div>
            <div className='
            flex
            flex-col
            w-full
            '>  
                <h1 className='font-semibold'>{viewProfile.name}</h1>
                <p className='truncate text-sm text-gray-400'>{viewProfile.email}</p>
            </div>
            <button type='button' aria-label='Close profile' className='rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white' onClick={()=>setViewProfile()}><X size={20}/></button>
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
            <p className='text-sm text-gray-400'>Phone</p>
            <div className='
            flex
            justify-end
            w-full
            '>
            <p>{viewProfile.phone_number}</p>
            </div>
        </div>
        {viewPaymentDetails && <div className='
        flex
        items-center
        '>
            <p className='text-sm text-gray-400'>Total Paid Amount</p>
            <div className='
            flex
            justify-end
            w-full
            '>
            <p>{viewProfile.total_cash_paid}</p>
            </div>
        </div>}
        <div className='
        flex
        items-center
        '>
            <p className='text-sm text-gray-400'>Membership Start</p>
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
            <p className='text-sm text-gray-400'>Membership End</p>
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
                viewPaymentDetails && viewProfile.status==='expired' &&

                <>
                     <p className='text-sm text-gray-400'>Overdue Amount</p>
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
