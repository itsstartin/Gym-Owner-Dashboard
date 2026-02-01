import React from 'react'

function MemberSearchBar() {
  return (
    <div className='
    flex
    rounded-[8px]
    bg-black
    text-white
    justify-end
    items-center
    gap-4
    w-full
    '>
        <input
        type='text'
        placeholder='Search member'
        className='w-full'
        />
        <div className='
        flex
        gap-2
        '>
            <img
            className='
            w-8
            h-8
            '
            />
            <select value=''>
                <option value=''>All Status</option>
                <option value=''>Active</option>
                <option value=''>Expired</option>
                <option value=''>Due</option>
            </select>
        </div>
        <select value=''>
                <option value=''>All Types</option>
                <option value=''>Basic</option>
                <option value=''>Premium</option>
                <option value=''>VIP</option>
        </select>
    </div>
  )
}

export default MemberSearchBar