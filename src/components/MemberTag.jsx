import React from 'react'

function MemberTag(props) {
  if(props.plan)
    if(props.plan==='Basic')
      return (
        <div className='
        flex
        rounded-md
        bg-blue-950
        text-blue-500
        px-2 py-0.5 text-xs font-semibold
        '>
            <h1>Basic</h1>
        </div>
      )
    else if(props.plan==='Premium')
      return (
        <div className='
        flex
        rounded-md
        bg-green-950
        text-green-500
        px-2 py-0.5 text-xs font-semibold
        '>
            <h1>Premium</h1>
        </div>
      )
    else
      return(
        <div className='
        flex
        rounded-md
        bg-violet-950
        text-violet-500
        px-2 py-0.5 text-xs font-semibold
        '>
          <h1>VIP</h1>
        </div>
      )
  else
    if(props.status==='active')
      return (
        <div className='
        flex
        rounded-md
        bg-green-950
        text-green-500
        px-2 py-0.5 text-xs font-semibold
        '>
            <h1>Active</h1>
        </div>
      )
    else if(props.status==='due')
      return (
        <div className='
        flex
        rounded-md
        bg-orange-950
        text-orange-500
        px-2 py-0.5 text-xs font-semibold
        '>
            <h1>Due</h1>
        </div>
      )
    else if(props.status==='inactive')
      return(
        <div className='
        flex
        rounded-md
        bg-gray-800
        text-gray-300
        px-2 py-0.5 text-xs font-semibold
        '>
          <h1>Inactive</h1>
        </div>
      )
    else
      return(
        <div className='
        flex
        rounded-md
        bg-red-950
        text-red-500
        px-2 py-0.5 text-xs font-semibold
        '>
          <h1>Expired</h1>
        </div>
      )
    
}

export default MemberTag
