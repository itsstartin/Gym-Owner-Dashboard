import React from 'react'

function IconDescBtn(props) {
  const Icon = props.icon;
  
  return (
    <button
    className='
    flex
    h-7.5
    w-36
    rounded-[8px]
    justify-start
    items-center
    bg-green-500
    text-[14px]
    font-bold
    text-white
    gap-2
    '>
      {!Icon ? <>
      <img
        className='
        w-6
        h-6
        '
        />
        <p>Button</p>
        </>
         :
         <>
      <Icon
        className='
        w-6
        h-6
        m-2
        '
        />
        <p>{props.label}</p>
        </>}
        
    </button>
  )
}

export default IconDescBtn