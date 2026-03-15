import React from 'react'
import MemberTag from './MemberTag'

function MemberViewProfile() {
  return (
    <div className='
    flex
    flex-col
    bg-gray-900
    text-white
    rounded-[8px]
    gap-2
    p-2
    '>
        <div className='
        flex
        gap-2
        '>
            <img className='
            w-10
            h-10
            '>
            </img>
            <div className='
            flex
            flex-col
            w-full
            '>  
                <h1>Salim</h1>
                <p>salimrash91@gmail.com</p>
            </div>
        </div>
        <div className='
        flex
        justify-start
        items-center
        gap-2
        '>
            {/* <MemberTag plan={props.member.membership_plan.name}/>
            <MemberTag status={props.member.status}/> */}
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
            <p>7878787878</p>
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
                <p>11/11/1111</p>
                {/* <p>{new Date(props.member.membership_start_date).toLocaleDateString()}</p> */}
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
            <p>22/22/2222</p>
            </div>
        </div>
        <div className='
        flex
        items-center
        '>
            <p>Due Amount:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
            <p>$25</p>
            </div>
        </div>
    </div>
  )
}

export default MemberViewProfile