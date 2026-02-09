import React from 'react'
import {Chart as ChartJS} from 'chart.js/auto';
import {Bar} from 'react-chartjs-2'

function GraphCard() {
  return (
    <div className='
    flex
    justify-center
    bg-gray-900
    rounded-[8px]
    text-white
    '>
        <div className='
        flex
        '>
          <Bar data={{
            labels:['A','B','C'],
            datasets:[
              {
                label:'Revenue',
                data:[100,200,300]
              },
              

              ]
          
          }
          } ></Bar>
        </div>

    </div>
  )
}

export default GraphCard