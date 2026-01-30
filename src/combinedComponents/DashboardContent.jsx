import React from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import GraphCard from '../components/GraphCard'

function DashboardContent() {
  return (
    <div className='
    flex
    flex-col
    w-full
    gap-2
    '>
        <div className='
        grid
        grid-cols-2
        '>
            <WelcomeHeader/>
            <div className='
            col-span-1
            flex
            justify-end
            items-center
            '>
                <div className='
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-2
                '>
                <IconDescBtn/>
                <IconDescBtn/>
                </div>
            </div>

        </div>
        <div className='
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-2
        '>
            <StatsCard/>
            <StatsCard/>
            <StatsCard/>
            <StatsCard/>
        </div>
        <div className='
        grid
        grid-cols-1
        md:grid-cols-2
        gap-2
        '>
            <GraphCard/>
            <GraphCard/>
        </div>

    </div>
  )
}

export default DashboardContent