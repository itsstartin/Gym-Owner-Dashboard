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
    <div className='flex flex-col gap-4'>
        <div className='
        grid
        grid-cols-2
        place-items-center
        bg-gray-900
        rounded-[8px]
        p-0.5'
        >
            <h1 onClick={()=>setGraphState('Rev')} className={graphState==='Rev'?
                ` bg-green-800
            text-center
            w-full
            rounded-md
            outline-1
            outline-green-800
          hover:outline-green-900 `
            :
            ' w-full text-center rounded-md hover:bg-gray-800 text-gray-500'
            }>Revenue</h1>
            <h1 onClick={()=>setGraphState('Att')} className={graphState==='Att'?
                ` bg-green-800
            text-center
            w-full
            rounded-md
            outline-1
            outline-green-800
          hover:outline-green-900 `
            :'w-full text-center rounded-md hover:bg-gray-800 text-gray-500'
            }>Attendance</h1>
        </div>
        {graphState === 'Rev'?
            <div className='
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-4
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