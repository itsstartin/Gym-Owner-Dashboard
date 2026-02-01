import React from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import MemberCard from '../components/MemberCard'
import MemberSearchBar from '../components/MemberSearchBar'

function MemberMenuContent() {
  return (
    <div className='
    flex
    flex-col
    w-full
    '>
        <WelcomeHeader/>
        <MemberSearchBar/>
        <div className='
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-2
        '>
            <MemberCard/>
            <MemberCard/>
            <MemberCard/>
            <MemberCard/>
            <MemberCard/>
            <MemberCard/>

        </div>

    </div>
  )
}

export default MemberMenuContent