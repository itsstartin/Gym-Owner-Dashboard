import React from 'react'
import { useSelector } from 'react-redux';

function IconDescBtn(props) {
  const Icon = props.icon;
  const OnClick = props.onClick;
  const currentPageState = useSelector((state)=>state.currentPageState.value)
  
  return (
    <button
    type={props.type || 'button'}
    onClick={OnClick ? OnClick : undefined}
    aria-label={props.label}
    className={`
    flex
    min-h-10
    px-3
    py-2
    rounded-lg
    justify-start
    items-center
    transition-colors
    duration-150
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-green-500
    ${props.sb && props.label!==currentPageState ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'bg-green-700 shadow-sm shadow-green-950 hover:bg-green-600'}
    text-[14px]
    font-semibold
    text-white
    gap-2
    `}>
      {!Icon ? <>
      {/* <img
        className='
        w-6
        h-6
        '
        /> */}
        <p>{props.label ? props.label : 'Button'}</p>
        </>
         :
         <>
      <Icon
        size={16}
        className='
        mr-1
        '
        />
        <p className='text-[13px]'>{props.label}</p>
        </>}
        
    </button>
  )
}

export default IconDescBtn
