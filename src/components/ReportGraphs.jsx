import React, { useEffect, useState } from 'react'
import GraphCard from './GraphCard'
import axios from '../axios'

function ReportGraphs() {
    const [graphState,setGraphState]=useState('Rev')
    const [graphData,setGraphData]=useState({})
    useEffect(()=>{
        axios.get('members/getgraph').then((res)=>{
            setGraphData(res.data)
        })
    },[])
  return (
    <div className='flex flex-col gap-5'>
        <div className='
        grid
        grid-cols-2
        place-items-center
        max-w-sm
        border border-gray-800
        bg-gray-900
        rounded-xl
        p-1'
        >
            <button type='button' onClick={()=>setGraphState('Rev')} className={graphState==='Rev'?
                ` bg-green-700
            text-center
            w-full
            rounded-lg
            py-2 text-sm font-semibold
            shadow-sm `
            :
            ' w-full rounded-lg py-2 text-center text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white'
            }>Revenue</button>
            <button type='button' onClick={()=>setGraphState('Att')} className={graphState==='Att'?
                ` bg-green-700
            text-center
            w-full
            rounded-lg
            py-2 text-sm font-semibold
            shadow-sm `
            :'w-full rounded-lg py-2 text-center text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white'
            }>Attendance</button>
        </div>
        {graphState === 'Rev'?
            <div className='
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-5
            '>
                <GraphCard obj={graphData.revenue} Bar title='Revenue'/>
                <GraphCard obj={graphData.member_growth} Bar Datasets/>
            </div>
        :
            <div className='
            grid
            grid-cols-1
            '>
                <GraphCard obj={graphData.hourly_attendance} Datasets/>
            </div>
        }
    </div>
  )
}

export default ReportGraphs
