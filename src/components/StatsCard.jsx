import React from 'react'

function StatsCard() {
  return (
    <div
    className='
    flex
    flex-col
    rounded-[8px]
    gap-6
    bg-black
    text-white
    '>
        <div
        className='
        flex
        justify-between
        '>
            <h1>Active Members</h1>
            <img
            className='
            w-6
            h-6
            '
            ></img>
        </div>
        <div
        className='
        flex
        flex-col
        justify-between
        align-start
        '>
            <h1>1247</h1>
            <p>12% from last month</p>

        </div>
    </div>
  )
}

export default StatsCard