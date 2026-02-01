import React from 'react'

function StatsCard() {
  return (
    <div
    className='
    flex
    flex-col
    rounded-[8px]
    gap-6
    bg-gray-800
    text-white
    p-5
    '>
        <div
        className='
        flex
        justify-between
        '>
            <h1 className='text-[14px] font-bold'>Active Members</h1>
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
            <h1 className='text-3xl font-extrabold'>1247</h1>
            <p className='text-[12px]'>+12% from last month</p>

        </div>
    </div>
  )
}

export default StatsCard