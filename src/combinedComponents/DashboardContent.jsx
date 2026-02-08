import React from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import GraphCard from '../components/GraphCard'
import { ChartLine, DollarSign, FileText, Plus, UserCheck, Users } from 'lucide-react'

function DashboardContent() {
  return (
    <div className='
    flex
    flex-col
    w-full
    gap-4
    p-3
    sm:p-6
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
                <IconDescBtn icon={Plus} label='Add Member'/>
                <IconDescBtn icon={FileText} label='View Reports'/>
                </div>
            </div>

        </div>
        <div className='
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-4
        '>
            <StatsCard icon={Users} title='Active Members'/>
            <StatsCard icon={UserCheck} title='Trainers'/>
            <StatsCard icon={DollarSign} title='Revenue This Month'/>
            <StatsCard icon={ChartLine} title="Today's Attendance"/>
        </div>
        <div className='
        grid
        grid-cols-1
        md:grid-cols-2
        gap-4
        '>
            <GraphCard/>
            <GraphCard/>
        </div>

    </div>
  )
}

export default DashboardContent