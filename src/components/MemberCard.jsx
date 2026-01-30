import React from 'react'
import MemberStatus from './MemberStatus'

function MemberCard() {
  return (
    <div className='
    flex
    flex-col
    bg-gray-700
    text-white
    rounded-[8px]
    gap-2
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
                <h1>John Doe</h1>
                <p>johndoe@gmail.com</p>
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
                <p>1/15/2004</p>
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
            <p>+91 9988998899</p>
            </div>
        </div>
        <div className='
        flex
        justify-center
        w-full
        items-center
        bg-black
        gap-2
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