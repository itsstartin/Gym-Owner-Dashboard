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
import OverdueCard from '../components/OverdueCard'

function PaymentsMenuContent() {
    const [recentPayments,setRecentPayments]=useState([])
    const [calcData,setCalcData]=useState({})
    const [overdueMembers,setOverdueMembers]=useState([])
    const [percentDiffData,setPercentDiffData]=useState({})
    useEffect(()=>{
        axios.get('members/getpayments').then((res)=>{
            setRecentPayments(res.data)
        })
        axios.get('members/getcalc').then((res)=>{
            setCalcData(res.data)
        })
        axios.get('members/overdue').then((res)=>{
            setOverdueMembers(res.data)
            console.log(res.data)
        })
        axios.get('members/getpercentstatdiff').then((res)=>{
            setPercentDiffData(res.data)
            console.log(res.data)
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
      gap-6
      min-h-screen
      max-h-fit
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
              <WelcomeHeader header="Payments" desc="Track and manage member payments" />
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
          gap-5
          '>
              <StatsCard icon={CircleAlert} title='Payments Overdue' num={`₹${calcData.overdue_amount || 0}`}/>
              <StatsCard icon={CircleDollarSign} title='Total Revenue This Month' num={`₹${calcData.month_revenue || 0}`} percentDiff={percentDiffData.month_revenue_percent_diff || 0} percentFrom='last month'/>
              <StatsCard icon={CircleCheckBig} title='Completed Payments' num={calcData.payment_count || 0}/>
              <StatsCard icon={Clock4} title="Payment in Advance" num={`₹${calcData.advance_amount || 0}`}/>
          </div>
          <div className='
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
          '>
              <div className='flex flex-col gap-4 border border-gray-800 bg-gray-900/50 p-4 rounded-xl h-[400px]'>
                <div className='flex flex-col gap-1'>
                    <h1 className='font-semibold'>Recent Transactions</h1>
                    <p className='text-sm text-gray-400'>Latest payment transactions from members</p>
                </div>
                <div className='flex flex-col gap-2 h-[310px] overflow-y-auto pr-1'>
                {
                    recentPayments.map((obj)=> {
                        //    const data = handleMember(obj.member)
                        //    console.log("the data is",data.name)
                        return <PaymentCard data={obj}/>
                    })}
                </div>

              </div>
              <div className='flex flex-col gap-4 border border-gray-800 bg-gray-900/50 p-4 rounded-xl h-[400px]'>
                <div className='flex flex-col gap-1'>
                    <h1 className='font-semibold'>Overdue Payments</h1>
                    <p className='text-sm text-gray-400'>Members with outstanding payments</p>
                </div>
                <div className='flex flex-col gap-2 h-[310px] overflow-y-auto pr-1'>
                {
                overdueMembers.map((obj)=> {
                //    const data = handleMember(obj.member)
                //    console.log("the data is",data.name)
                   return <OverdueCard obj={obj}/>
                })}
                </div>

              </div>
          </div>
  
      </div>
    )
}

export default PaymentsMenuContent
