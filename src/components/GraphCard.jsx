import React from 'react'
import {Chart as ChartJS} from 'chart.js/auto';
import {Bar,Line} from 'react-chartjs-2'

function GraphCard(props) {
  return (
    <div className='
    flex
    justify-center
    items-center
    w-full
    p-6
    bg-gray-900
    rounded-[8px]
    text-white
    '>
      {
      props.obj ?
        <div className='
        flex
        justify-center
        items-center
        w-full
        h-70
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
              }>
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
            }></Bar>
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
            
            }}>
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