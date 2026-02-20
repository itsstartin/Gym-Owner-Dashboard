import React from 'react'
import MemberStatus from './MemberStatus'

function MemberCard(props) {
    

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
                <h1>{props.member.name}</h1>
                <p>{props.member.email}</p>
            </div>
            <button className='
            h-6
            w-2
            '>
            </button>

        </div>
        <div className='
        flex
        justify-start
        items-center
        gap-2
        '>
            <MemberStatus/>
        </div>
        <div className='
        flex
        items-center
        '>
            <p>Joined:</p>
            <div className='
            flex
            justify-end
            w-full
            '>
                <p>{new Date(props.member.created_at).toLocaleDateString()}</p>
            </div>

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
            <p>{props.member.phone_number}</p>
            </div>
        </div>
        <div className='
        flex
        justify-center
        w-full
        items-center
        bg-black
        gap-2
        rounded-[8px]
        '>
            <img className='
            w-6
            h-6
            '>
            </img>
            <h1>View Profile</h1>
        </div>

    </div>
  )
}

export default MemberCard