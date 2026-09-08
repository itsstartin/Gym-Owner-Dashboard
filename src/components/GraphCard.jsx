import React from 'react'
import {Chart as ChartJS} from 'chart.js/auto';
import {Bar,Line} from 'react-chartjs-2'

function GraphCard(props) {
  return (
    <div className='
    flex
    flex-col
    justify-center
    items-stretch
    w-full
    gap-4
    p-5
    bg-gray-900/80
    rounded-xl
    text-white
    border
    border-gray-800
    shadow-sm
    shadow-black/20
    '>
      {
      props.title && <div><h2 className='font-semibold'>{props.title}</h2><p className='mt-0.5 text-sm text-gray-400'>Performance overview</p></div>
      }
      {
      props.obj ?
        <div className='
        flex
        justify-center
        items-center
        w-full
        h-72
        '>
        {
          props.Datasets ?
            props.Bar ? 
              <Bar 
              data={{
                labels:props.obj.labels,
                datasets:props.obj.datasets.map((obj)=>({ 
                      label:obj.name,
                      data:obj.data
                }))
              }
              }
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              >
              </Bar>
            :
              <Line 
              data={{
                labels:props.obj.labels,
                datasets:props.obj.datasets.map((obj)=>({ 
                      label:obj.name,
                      data:obj.data                      
                }))
              }
              }
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              >
              </Line>
          :
          

            props.Bar ? 
              <Bar 
              data={{
                labels:props.obj.labels,
                datasets:[
                  {
                    label:props.title,
                    data:props.obj.data
                  },
                  
                ]     
              }
              }
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              ></Bar>
            :
              <Line 
              data={{
                labels:props.obj.labels,
                datasets:[
                  {
                    label:props.title,
                    data:props.obj.data
                  },
                ]        
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              >
              </Line>
        
        }
        </div>
      :
      <div className='
        flex
        '>
          <Bar data={{
            labels:['A','B','C'],
            datasets:[
              {
                label:'Revenue',
                data:[100,200,500]
              },       
            ]   
          }
        } ></Bar>
        </div>
      }
    </div>
  )
}

export default GraphCard
