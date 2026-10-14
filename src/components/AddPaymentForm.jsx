import axios from '../axios'
import React, { useEffect, useState } from 'react'
import CurrencyInput from 'react-currency-input-field'
import { paymentsOn } from '../features/currentPageSlice'
import IconDescBtn from './IconDescBtn'
import { useDispatch } from 'react-redux'

function AddPaymentForm() {
    const dispatch = useDispatch()
    const [paymentForm,setPaymentForm]=useState({
        'member':'',
        'amount':'',
        'payment_type':''
    })
    const handleChange = (e) => {
        e.preventDefault()
        const {name,value} = e.target
        setPaymentForm((prev)=>({
            ...prev,
            [name]:value
        }))
    }
    const handleSubmit = async (e)=>{
        e.preventDefault()
        try{
            await axios.post('members/pay',paymentForm)
            setPaymentForm({
                'member':'',
                'amount':'',
                'payment_type':''
            })
            alert("Payment Added Successfully")
        }
        catch (error) {
            alert("Error saving data")
        }
    }
    const [members,setMembers]=useState([])
    useEffect(()=>{
        axios.get('members/get').then((res)=>{
            setMembers(res.data)
        })
    },[])
  return (
    <div className='
    fixed
    inset-0
    z-40
    flex
    items-center
    justify-center
    bg-black/70
    p-4
    backdrop-blur-sm
    '>
    
    <form onSubmit={handleSubmit} className='
    flex
    flex-col
    w-full
    max-w-lg
    gap-4
    bg-gray-900
    text-white
    p-5
    rounded-xl
    border
    border-gray-800
    shadow-2xl
    '>
        <div><h1 className='text-xl font-bold'>Add New Payment</h1><p className='mt-1 text-sm text-gray-400'>Record a member payment and its method.</p></div>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <label className='mb-1 text-sm font-medium text-gray-300'>Payment From</label>
            <select name='member' onChange={(e)=>handleChange(e)}
            required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-green-600'
            value={paymentForm.member}>
                <option value=''>Select Member</option>
                {members ? 
                members.map((obj)=>{
                    return <option value={obj.id} key={obj.id}>{obj.name}</option>
                })
                :''}
            </select>
        </div>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <label className='mb-1 text-sm font-medium text-gray-300'>Amount</label>
            <CurrencyInput name='amount' placeholder='Please Enter the amount'
            onChange={(e)=>handleChange(e)} 
            value={paymentForm.amount} required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-green-600'
            ></CurrencyInput>
        </div>
        <select value={paymentForm.payment_type} name='payment_type' required className='w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-green-600' onChange={(e)=>handleChange(e)}>
            <option value="">Select Payment Type</option>
            <option value='cash'>Cash</option>
            <option value='card'>Card</option>
            <option value='upi'>UPI</option>     
        </select>
        
        <div className="
        flex
        justify-end
        w-full
        gap-2
        ">
            <IconDescBtn label="Cancel" onClick={()=>dispatch(paymentsOn())}/>
            <IconDescBtn type="submit" label='Create Payment'/>
        </div> 
    </form>
    </div>
  )
}

export default AddPaymentForm
