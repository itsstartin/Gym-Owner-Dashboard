import React from 'react'

function MemberTag(props) {
  if(props.plan)
    if(props.plan==='Basic')
      return (
        <div className='
        flex
        rounded-[4px]
        bg-blue-950
        text-blue-500
        '>
            <h1>Basic</h1>
        </div>
      )
    else if(props.plan==='Premium')
      return (
        <div className='
        flex
        rounded-[4px]
        bg-green-950
        text-green-500
        '>
            <h1>Premium</h1>
        </div>
      )
    else
      return(
        <div className='
        flex
        rounded-[4px]
        bg-violet-950
        text-violet-500
        '>
          <h1>VIP</h1>
        </div>
      )
  else
    if(props.status==='active')
      return (
        <div className='
        flex
        rounded-[4px]
        bg-green-950
        text-green-500
        '>
            <h1>Active</h1>
        </div>
      )
    else if(props.status==='due')
      return (
        <div className='
        flex
        rounded-[4px]
        bg-orange-950
        text-orange-500
        '>
            <h1>Due</h1>
        </div>
      )
    else
      return(
        <div className='
        flex
        rounded-[4px]
        bg-red-950
        text-red-500
        '>
          <h1>Expired</h1>
        </div>
      )
    
}

export default MemberTag