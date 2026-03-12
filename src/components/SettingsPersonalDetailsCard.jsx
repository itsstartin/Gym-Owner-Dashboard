import React from 'react'

function SettingsPersonalDetailsCard(props) {
  return (
    <div className='
    grid
    grid-cols-3
    place-items-center
    '>
        <h1 className='font-extrabold text-start w-full'>{props.title}</h1>
        <p className='text-start w-full'>{props.desc}</p>
        <div className='flex justify-end p-2 w-full '>
            <button className='outline-1 p-0.5 rounded-md'>Edit</button>
        </div>
    </div>
  )
}

export default SettingsPersonalDetailsCard