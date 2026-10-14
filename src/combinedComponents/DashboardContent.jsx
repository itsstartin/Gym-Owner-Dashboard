import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import { ArrowRight, CalendarClock, ChartLine, IndianRupee, Plus, ShieldAlert, UserRoundX, Users } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addMemberOn, membersWithFilters } from '../features/currentPageSlice'
import axios from '../axios'
import { ErrorState, LoadingState } from '../components/AsyncState'

const GraphCard = lazy(() => import('../components/GraphCard'))

function DashboardContent() {
    const dispatch = useDispatch()
    const [calcData,setCalcData]=useState({})
    const [graphData,setGraphData]=useState({})
    const [percentDiffData,setPercentDiffData]=useState({})
    const [userDetails,setUserDetails]=useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const retention = calcData.retention || {
        at_risk_count: 0,
        inactive_count: 0,
        expiring_soon_count: 0,
        suggested_actions: [],
    }

    const openMembers = (filters) => {
        dispatch(membersWithFilters(filters))
    }

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
        <section className='flex flex-col gap-4'>
          <div>
            <h2 className='text-lg font-semibold'>Member Retention</h2>
            <p className='mt-1 text-sm text-gray-400'>Focus follow-ups where they can make the biggest difference.</p>
          </div>
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
            <StatsCard icon={ShieldAlert} title='At-Risk Members' num={retention.at_risk_count} ariaLabel='View at-risk members' onClick={() => openMembers({ health: 'at_risk' })}/>
            <StatsCard icon={UserRoundX} title='Inactive Members' num={retention.inactive_count} ariaLabel='View inactive members' onClick={() => openMembers({ status: 'inactive' })}/>
            <StatsCard icon={CalendarClock} title='Expiring in 7 Days' num={retention.expiring_soon_count} ariaLabel='View memberships expiring soon' onClick={() => openMembers({ expiry: 'expiring_soon' })}/>
          </div>
          <div className='rounded-xl border border-gray-800 bg-gray-900/80 p-5 shadow-sm shadow-black/20'>
            <div>
              <h3 className='font-semibold'>Suggested Actions</h3>
              <p className='mt-1 text-sm text-gray-400'>Open the relevant member list to take action.</p>
            </div>
            <div className='mt-4 grid gap-2'>
              {retention.suggested_actions.map((action) => (
                <button key={action.id} type='button' onClick={() => openMembers(action.filter)} className='flex items-center justify-between gap-4 rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-left transition-colors hover:border-green-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500'>
                  <span>
                    <span className='block text-sm font-medium'>{action.title}</span>
                    <span className='mt-1 block text-xs text-gray-400'>{action.description}</span>
                  </span>
                  <span className='flex items-center gap-2 text-sm font-semibold text-green-400'>{action.count}<ArrowRight size={16}/></span>
                </button>
              ))}
            </div>
          </div>
        </section>
        <Suspense fallback={<LoadingState message="Loading dashboard charts..." />}>
          <div className='
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
          '>
              <GraphCard title='Revenue' obj={graphData.revenue} Bar/>
              <GraphCard title='Weekly Attendance' obj={graphData.weekly_attendance}/>
          </div>
        </Suspense>
        </>}
    </div>
  )
}

export default DashboardContent
