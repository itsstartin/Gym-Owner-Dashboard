import React from 'react'

function WelcomeHeader() {
  return (
    <div className='
    flex
    flex-col 
    items-start 
    justify-between
    text-white
    bg-black
    gap-2
    '>
        <button>
            <img className='
            w-6
            h-6
            '></img>
        </button>
        <h1>Welcome back, Admin</h1>
        <p>Here is what is happening at gym today</p>
    </div>
  )
}

export default WelcomeHeader