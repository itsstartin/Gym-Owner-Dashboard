import React, { useEffect, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import GraphCard from '../components/GraphCard'
import { ChartLine, FileText, IndianRupee, Plus, UserCheck, Users } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addMemberOn } from '../features/currentPageSlice'
import axios from '../axios'

function DashboardContent() {
    const dispatch = useDispatch()
    const [calcData,setCalcData]=useState({})
    const [graphData,setGraphData]=useState({})
    const [percentDiffData,setPercentDiffData]=useState({})
    const [userDetails,setUserDetails]=useState({})
    useEffect(()=>{
        axios.get('members/getcalc').then((res)=>{
            setCalcData(res.data)
        })
        axios.get('members/getgraph').then((res)=>{
            setGraphData(res.data)
            console.log(res.data)
        })
        axios.get('members/addnotification').then((res)=>{
            console.log(res.data)
        })
        axios.get('members/getpercentstatdiff').then((res)=>{
            setPercentDiffData(res.data)
            console.log(res.data)
        })
        axios.get('members/user').then((res)=>{
            setUserDetails(res.data)
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
        grid-cols-2

        '>
            <WelcomeHeader header={`Welcome back, ${userDetails.username || 'Admin'}`} desc="Here is what is happening at gym today" />
            <div className='
            col-span-1
            flex
            justify-end
            items-center
            '>
                <div className='
                grid
                grid-cols-1
                gap-2
                '>
                <IconDescBtn icon={Plus} label='Add Member' onClick={()=>dispatch(addMemberOn())}/>
                </div>
            </div>

        </div>
        <div className='
        grid
        grid-cols-1
        lg:grid-cols-3
        gap-4
        '>
            <StatsCard icon={Users} title='Active Members' num={calcData.members_count || 0}/>
            <StatsCard icon={IndianRupee} title='Revenue This Month' num={`₹${calcData.month_revenue || 0}`} percentDiff={percentDiffData.month_revenue_percent_diff || 0} percentFrom='last month'/>
            <StatsCard icon={ChartLine} title="Today's Attendance" num={calcData.today_att_count || 0} percentDiff={percentDiffData.today_att_percent_diff || 0} percentFrom='yesterday'/>
        </div>
        <div className='
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-4
        '>
            <GraphCard title='Revenue' obj={graphData.revenue} Bar/>
            <GraphCard title='Weekly Attendance' obj={graphData.weekly_attendance}/>
        </div>

    </div>
  )
}

export default DashboardContent