import React, { useCallback, useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import GraphCard from '../components/GraphCard'
import { ChartLine, IndianRupee, Plus, Users } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addMemberOn } from '../features/currentPageSlice'
import axios from '../axios'
import { ErrorState, LoadingState } from '../components/AsyncState'

function DashboardContent() {
    const dispatch = useDispatch()
    const [calcData,setCalcData]=useState({})
    const [graphData,setGraphData]=useState({})
    const [percentDiffData,setPercentDiffData]=useState({})
    const [userDetails,setUserDetails]=useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const loadDashboard = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            const [calc, graph, percentDiff, user] = await Promise.all([
                axios.get('members/getcalc'),
                axios.get('members/getgraph'),
                axios.get('members/getpercentstatdiff'),
                axios.get('members/user'),
            ])
            setCalcData(calc.data)
            setGraphData(graph.data)
            setPercentDiffData(percentDiff.data)
            setUserDetails(user.data)
            axios.get('members/addnotification').catch(() => {})
        } catch {
            setError('Unable to load the dashboard. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(()=>{
        loadDashboard()
    },[loadDashboard])

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
        <div className='
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        '>
            <WelcomeHeader header={'Welcome back, ' + (userDetails.username || 'Admin')} desc="Here is what is happening at gym today" />
            <div className='
            col-span-1
            flex
            justify-end
            items-center
            '>
                <div className='
                grid
                grid-cols-1
                '>
                <IconDescBtn icon={Plus} label='Add Member' onClick={()=>dispatch(addMemberOn())}/>
                </div>
            </div>
        </div>

        {isLoading ? <LoadingState message="Loading dashboard..." /> : error ? <ErrorState message={error} onRetry={loadDashboard} /> : <>
        <div className='
        grid
        grid-cols-1
        lg:grid-cols-3
        gap-5
        '>
            <StatsCard icon={Users} title='Active Members' num={calcData.members_count || 0}/>
            <StatsCard icon={IndianRupee} title='Revenue This Month' num={'\u20B9' + (calcData.month_revenue || 0)} percentDiff={percentDiffData.month_revenue_percent_diff || 0} percentFrom='last month'/>
            <StatsCard icon={ChartLine} title="Today's Attendance" num={calcData.today_att_count || 0} percentDiff={percentDiffData.today_att_percent_diff || 0} percentFrom='yesterday'/>
        </div>
        <div className='
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-5
        '>
            <GraphCard title='Revenue' obj={graphData.revenue} Bar/>
            <GraphCard title='Weekly Attendance' obj={graphData.weekly_attendance}/>
        </div>
        </>}
    </div>
  )
}

export default DashboardContent
