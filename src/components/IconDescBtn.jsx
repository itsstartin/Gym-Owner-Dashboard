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
    w-full
    p-1.5
    rounded-[8px]
    justify-start
    items-center
    ${props.sb && props.label!==currentPageState ? '' : 'bg-green-800'}
    text-[14px]
    font-bold
    text-white
    gap-2
    `}>
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