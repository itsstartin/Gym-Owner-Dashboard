import { Funnel, Search } from 'lucide-react'
import React from 'react'

function MemberSearchBar({filterValue, setFilterValue}) {

  const handleChange = (e) => {
    setFilterValue({
      ...filterValue,
      [e.target.name]: e.target.value
    })
  }
  return (
    <div className='
    flex
    flex-col
    rounded-xl
    bg-gray-900/70
    text-gray-400
    justify-end
    items-center
    gap-3
    w-full
    p-3
    border
    border-gray-800
    sm:flex-row
    
    '>
        <div className='flex w-full items-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 focus-within:border-green-700'>

          <Search size={20}/>
          <input
          value={filterValue.search}
          name='search'
          type='text'
          placeholder='Search member'
          className='w-full bg-transparent text-sm outline-none'
          onChange={handleChange}
          />
        </div>
        <div className='
        flex
        w-full
        sm:w-auto
        gap-2
        bg-gray-950 border border-gray-700 rounded-lg px-3 py-2
        '>
            <Funnel size={20} className='hidden lg:flex'/>
            <select value={filterValue.status} name='status' className='w-full bg-transparent text-sm outline-none sm:w-auto' onChange={handleChange}>
                <option value=''>All Status</option>
                <option value='active'>Active</option>
                <option value='expired'>Expired</option>
                <option value='inactive'>Inactive</option>
                <option value='due'>Due</option>
            </select>
        </div>
        <select value={filterValue.type} name='type' className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-green-700 sm:w-auto' onChange={handleChange}>
                <option value=''>All Types</option>
                <option value='Basic'>Basic</option>
                <option value='Premium'>Premium</option>
                <option value='VIP'>VIP</option>
        </select>
        <select value={filterValue.health} name='health' className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-green-700 sm:w-auto' onChange={handleChange}>
                <option value=''>All Health</option>
                <option value='at_risk'>At-risk members</option>
        </select>
        <select value={filterValue.expiry} name='expiry' className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm outline-none focus:border-green-700 sm:w-auto' onChange={handleChange}>
                <option value=''>All Memberships</option>
                <option value='expiring_soon'>Expiring in 7 days</option>
        </select>
    </div>
  )
}

export default MemberSearchBar
