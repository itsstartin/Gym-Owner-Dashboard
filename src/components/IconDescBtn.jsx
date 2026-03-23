import React from 'react'
import { useSelector } from 'react-redux';

function IconDescBtn(props) {
  const Icon = props.icon;
  const OnClick = props.onClick;
  const currentPageState = useSelector((state)=>state.currentPageState.value)
  
  return (
    <button
    onClick={OnClick ? OnClick : null}
    className={`
    flex
    h-7.5
    
    p-1.5
    rounded-[8px]
    justify-start
    items-center
    ${props.sb && props.label!==currentPageState ? 'hover:bg-gray-800' : 'bg-green-800 hover:bg-green-900'}
    text-[14px]
    font-bold
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
        m-2
        '
        />
        <p className='text-[13px]'>{props.label}</p>
        </>}
        
    </button>
  )
}

export default IconDescBtn