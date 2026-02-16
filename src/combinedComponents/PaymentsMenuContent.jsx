import { CircleAlert, CircleCheckBig, CircleDollarSign, Clock4, DollarSign, Send } from 'lucide-react'
import React from 'react'
import { useDispatch } from 'react-redux'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import GraphCard from '../components/GraphCard'

function PaymentsMenuContent() {
    const dispatch = useDispatch()
    return (
      <div className='
      flex
      flex-col
      w-full
      gap-4
      p-3
      sm:p-6
      '>
          <div className='
          grid
          grid-cols-2
  
          '>
              <WelcomeHeader/>
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
                  <IconDescBtn icon={Send} label='Send Reminders'/>
                  </div>
              </div>
  
          </div>
          <div className='
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-4
          '>
              <StatsCard icon={CircleAlert} title='Payments Due'/>
              <StatsCard icon={CircleDollarSign} title='Total Revenue This Month'/>
              <StatsCard icon={CircleCheckBig} title='Completed Payments'/>
              <StatsCard icon={Clock4} title="Processing"/>
          </div>
          <div className='
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
          '>
              <GraphCard/>
              <GraphCard/>
          </div>
  
      </div>
    )
}

export default PaymentsMenuContent