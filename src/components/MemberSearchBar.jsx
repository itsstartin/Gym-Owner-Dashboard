import { Funnel, Search } from 'lucide-react'
import React, { useState } from 'react'

function MemberSearchBar() {

  const [searchValue, setSearchValue] = useState({
    search: '',
    status: '',
    type: '',
  })
  const handleChange = (e) => {
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value
    })
  }
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
          value={searchValue.search}
          name='search'
          type='text'
          placeholder='Search member'
          className='w-full
          outline-none
          '
          onChange={handleChange}
          />
        </div>
        <div className='
        flex
        gap-2
        bg-gray-900 outline-1 outline-gray-700 rounded-[8px] p-1
        '>
            <Funnel/>
            <select value={searchValue.status} name='status' className='bg-gray-900 outline-none' onChange={handleChange}>
                <option value=''>All Status</option>
                <option value='active'>Active</option>
                <option value='expired'>Expired</option>
                <option value='due'>Due</option>
            </select>
        </div>
        <select value={searchValue.type} name='type' className='bg-gray-900 outline-1 outline-gray-700 rounded-[8px] p-1' onChange={handleChange}>
                <option value=''>All Types</option>
                <option value='basic'>Basic</option>
                <option value='premium'>Premium</option>
                <option value='vip'>VIP</option>
        </select>
    </div>
  )
}

export default MemberSearchBar