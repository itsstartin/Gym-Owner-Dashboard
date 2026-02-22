import { CircleAlert, CircleCheckBig, CircleDollarSign, Clock4, Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import GraphCard from '../components/GraphCard'
import { addPaymentOn } from '../features/currentPageSlice'
import axios from '../axios'
import PaymentCard from '../components/PaymentCard'

function PaymentsMenuContent() {
    const [recentPayments,setRecentPayments]=useState([])
    useEffect(()=>{
        axios.get('members/getpayments').then((res)=>{
            setRecentPayments(res.data)
        })
    },[])
    // const handleMember = async(id)=>{
    //     const memberData =await axios.get(`members/get/${id}`)
    //     return memberData.data
    // }
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
                  <IconDescBtn icon={Plus} label='Add Payment' onClick={()=>dispatch(addPaymentOn())}/>
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
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col'>
                    <h1>Recent Transactions</h1>
                    <p>Latest payment transactions from members</p>
                </div>
                {
                [...recentPayments].reverse().map((obj)=> {
                //    const data = handleMember(obj.member)
                //    console.log("the data is",data.name)
                   return <PaymentCard data={obj}/>
                })}

              </div>
              <GraphCard/>
          </div>
  
      </div>
    )
}

export default PaymentsMenuContent