import React, { useEffect, useState } from 'react'
import GraphCard from '../components/GraphCard'
import StatsCard from '../components/StatsCard'
import IconDescBtn from '../components/IconDescBtn'
import WelcomeHeader from '../components/WelcomeHeader'
import { Calendar, DollarSign, Download, TrendingUp, Users } from 'lucide-react'
import axios from '../axios'

function ReportsMenuContent() {
    const [calcData,setCalcData]=useState({})
    useEffect(()=>{
        axios.get('members/getcalc').then((res)=>{
            console.log(res.data)
            setCalcData(res.data)
        })
    },[])
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
                  lg:grid-cols-2
                  gap-2
                  '>
                  <IconDescBtn icon={Calendar} label='This Year'/>
                  <IconDescBtn icon={Download} label='Download Report'/>
                  </div>
              </div>
  
          </div>
          <div className='
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-4
          '>
              <StatsCard icon={DollarSign} title='Total Revenue' num={calcData.total_revenue}/>
              <StatsCard icon={Users} title='Avg. Daily Attendance'/>
              <StatsCard icon={TrendingUp} title='Member Retention'/>
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

export default ReportsMenuContent