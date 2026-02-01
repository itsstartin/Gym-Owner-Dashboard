import React from 'react'

function WelcomeHeader() {
  return (
    <div className='
    flex
    flex-col 
    items-start 
    justify-between
    text-white
    gap-0.5
    '>
        <button>
            <img className='
            w-6
            h-6
            '></img>
        </button>
        <h1 className='text-3xl font-extrabold'>Welcome back, Admin</h1>
        <p className='text-gray-400 text-[15px]'>Here is what is happening at gym today</p>
    </div>
  )
}

export default WelcomeHeader