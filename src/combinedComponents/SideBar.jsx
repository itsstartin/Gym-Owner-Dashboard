import React from 'react'
import GymIcon from '../components/GymIcon'
import IconDescBtn from '../components/IconDescBtn'

function SideBar() {
  return (
    <div className='
    flex
    flex-col
    self-start
    sticky
    top-0
    justify-between
    items-center
    w-44
    h-screen
    
    '>
        <GymIcon/>
        <div className='
        flex
        flex-col
        justify-start
        h-full
        
        
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
        
        '>
            <IconDescBtn/>
            <IconDescBtn/>
            <IconDescBtn/>

        </div>

    </div>
  )
}

export default SideBar