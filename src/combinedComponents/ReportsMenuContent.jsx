import React, { useEffect, useState } from 'react'
import GraphCard from '../components/GraphCard'
import StatsCard from '../components/StatsCard'
import IconDescBtn from '../components/IconDescBtn'
import WelcomeHeader from '../components/WelcomeHeader'
import { Calendar, DollarSign, Download, TrendingUp, Users } from 'lucide-react'
import axios from '../axios'
import ReportGraphs from '../components/ReportGraphs'

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
      min-h-screen
      max-h-fit
      gap-4
      p-3
      sm:p-6
      '>
          <div className='
          grid
          grid-cols-1
  
          '>
              <WelcomeHeader header="Reports & Analytics" desc="Comprehensive insights into your gym's performance" />
              
  
          </div>
          <div className='
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-4
          '>
            <StatsCard icon={DollarSign} title='Total Revenue' num={`₹${calcData.total_revenue || 0}`}/>
            <StatsCard icon={Users} title='Avg. Daily Attendance' num={calcData.month_att_avg || 0}/>
          </div>
          <ReportGraphs/>
  
      </div>
    )
}

export default ReportsMenuContent