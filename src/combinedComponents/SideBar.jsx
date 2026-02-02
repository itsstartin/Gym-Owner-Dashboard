import React from 'react'
import GymIcon from '../components/GymIcon'
import IconDescBtn from '../components/IconDescBtn'

function SideBar() {
  return (
    <div className='
    flex
    flex-col
    self-start
    fixed
    -translate-x-full
    md:sticky md:translate-x-0
    top-0
    justify-between
    items-center
    w-44
    p-3.5
    h-screen
    bg-gray-800
    '>
        <GymIcon/>
        <div className='
        flex
        flex-col
        justify-start
        h-full
        gap-2
        
        '>
            <IconDescBtn/>
            <IconDescBtn/>
            <IconDescBtn/>
            <IconDescBtn/>

        </div>
        <div className='
        flex
        flex-col
        justify-center
        items-center
        gap-2
        
        '>
            <IconDescBtn/>
            <IconDescBtn/>
            <IconDescBtn/>

        </div>

    </div>
  )
}

export default SideBar