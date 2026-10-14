import React, { useCallback, useEffect, useState } from 'react'
import StatsCard from '../components/StatsCard'
import WelcomeHeader from '../components/WelcomeHeader'
import { DollarSign, Users } from 'lucide-react'
import axios from '../axios'
import ReportGraphs from '../components/ReportGraphs'
import { ErrorState, LoadingState } from '../components/AsyncState'

function ReportsMenuContent() {
    const [calcData,setCalcData]=useState({})
    const [graphData, setGraphData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const loadReports = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            const [calculation, graphs] = await Promise.all([
                axios.get('members/getcalc'),
                axios.get('members/getgraph'),
            ])
            setCalcData(calculation.data)
            setGraphData(graphs.data)
        } catch {
            setError('Unable to load reports. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(()=>{
        loadReports()
    },[loadReports])

    return (
      <div className='
      flex
      flex-col
      w-full
      min-h-screen
      max-h-fit
      gap-6
      p-4
      sm:p-6
      lg:p-8
      '>
          <WelcomeHeader header="Reports & Analytics" desc="Comprehensive insights into your gym's performance" />
          {isLoading ? <LoadingState message="Loading reports..." /> : error ? <ErrorState message={error} onRetry={loadReports} /> : <>
          <div className='
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
          '>
            <StatsCard icon={DollarSign} title='Total Revenue' num={'\u20B9' + (calcData.total_revenue || 0)}/>
            <StatsCard icon={Users} title='Avg. Daily Attendance' num={calcData.month_att_avg || 0}/>
          </div>
          <ReportGraphs graphData={graphData}/>
          </>}
      </div>
    )
}

export default ReportsMenuContent
