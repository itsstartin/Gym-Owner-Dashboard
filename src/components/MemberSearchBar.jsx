import { Funnel, Search, SearchAlert, SearchIcon } from 'lucide-react'
import React from 'react'

function MemberSearchBar() {
  return (
    <div className='
    flex
    rounded-[8px]
    bg-gray-900
    text-gray-400
    justify-end
    items-center
    gap-2
    w-full
    p-4
    outline-1
    outline-gray-800
    
    '>
        <div className='flex w-full outline-1 outline-gray-700 rounded-[8px] p-1'>

          <Search/>
          <input
          type='text'
          placeholder='Search member'
          className='w-full
          outline-none
          '
          />
        </div>
        <div className='
        flex
        gap-2
        bg-gray-900 outline-1 outline-gray-700 rounded-[8px] p-1
        '>
            <Funnel/>
            <select value='' className='bg-gray-900 outline-none'>
                <option value=''>All Status</option>
                <option value=''>Active</option>
                <option value=''>Expired</option>
                <option value=''>Due</option>
            </select>
        </div>
        <select value='' className='bg-gray-900 outline-1 outline-gray-700 rounded-[8px] p-1'>
                <option value=''>All Types</option>
                <option value=''>Basic</option>
                <option value=''>Premium</option>
                <option value=''>VIP</option>
        </select>
    </div>
  )
}

export default MemberSearchBar