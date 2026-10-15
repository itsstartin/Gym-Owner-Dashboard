import { CircleAlert, CircleCheckBig, CircleDollarSign, Clock4, Plus } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import WelcomeHeader from '../components/WelcomeHeader'
import IconDescBtn from '../components/IconDescBtn'
import StatsCard from '../components/StatsCard'
import { addPaymentOn } from '../features/currentPageSlice'
import axios from '../axios'
import PaymentCard from '../components/PaymentCard'
import OverdueCard from '../components/OverdueCard'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState'

function PaymentsMenuContent({ isActive, dataVersion }) {
    const [recentPayments,setRecentPayments]=useState([])
    const [calcData,setCalcData]=useState({})
    const [overdueMembers,setOverdueMembers]=useState([])
    const [percentDiffData,setPercentDiffData]=useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const loadedDataVersion = useRef(dataVersion)
    const dispatch = useDispatch()

    const loadPayments = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            const [payments, calculation, overdue, percentDiff] = await Promise.all([
                axios.get('members/getpayments'),
                axios.get('members/getcalc'),
                axios.get('members/overdue'),
                axios.get('members/getpercentstatdiff'),
            ])
            setRecentPayments(payments.data)
            setCalcData(calculation.data)
            setOverdueMembers(overdue.data)
            setPercentDiffData(percentDiff.data)
        } catch {
            setError('Unable to load payment data. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(()=>{
        loadPayments()
    },[loadPayments])

    useEffect(() => {
        if (!isActive || loadedDataVersion.current === dataVersion) return
        loadedDataVersion.current = dataVersion
        loadPayments()
    }, [dataVersion, isActive, loadPayments])

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

          {isLoading ? <LoadingState message="Loading payment data..." /> : error ? <ErrorState message={error} onRetry={loadPayments} /> : <>
          <div className='
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-5
          '>
              <StatsCard icon={CircleAlert} title='Payments Overdue' num={'\u20B9' + (calcData.overdue_amount || 0)}/>
              <StatsCard icon={CircleDollarSign} title='Total Revenue This Month' num={'\u20B9' + (calcData.month_revenue || 0)} percentDiff={percentDiffData.month_revenue_percent_diff || 0} percentFrom='last month'/>
              <StatsCard icon={CircleCheckBig} title='Completed Payments' num={calcData.payment_count || 0}/>
              <StatsCard icon={Clock4} title="Payment in Advance" num={'\u20B9' + (calcData.advance_amount || 0)}/>
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
                  {recentPayments.length > 0
                    ? recentPayments.map((obj) => <PaymentCard data={obj} key={obj.id}/>)
                    : <EmptyState title="No payments yet" message="New payment transactions will appear here." />
                  }
                </div>
              </div>
              <div className='flex flex-col gap-4 border border-gray-800 bg-gray-900/50 p-4 rounded-xl h-[400px]'>
                <div className='flex flex-col gap-1'>
                    <h1 className='font-semibold'>Overdue Payments</h1>
                    <p className='text-sm text-gray-400'>Members with outstanding payments</p>
                </div>
                <div className='flex flex-col gap-2 h-[310px] overflow-y-auto pr-1'>
                  {overdueMembers.length > 0
                    ? overdueMembers.map((obj) => <OverdueCard obj={obj} key={obj.id}/>)
                    : <EmptyState title="No overdue payments" message="All member payments are up to date." />
                  }
                </div>
              </div>
          </div>
          </>}
      </div>
    )
}

export default PaymentsMenuContent
