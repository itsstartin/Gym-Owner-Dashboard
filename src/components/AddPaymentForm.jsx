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
            const responce = await axios.post('members/pay',paymentForm)
            const memberDet = await axios.get(`members/get/${paymentForm.member}`)
            const currentAmount = memberDet.data.total_cash_paid
            if (currentAmount === null) {
                const updatedAmount = Number(paymentForm.amount)
                const res = await axios.patch(`members/update/${paymentForm.member}`, { total_cash_paid: updatedAmount })
                console.log(updatedAmount)
                console.log("Saved", responce.data, "updated ", res.data)
            } else {
                const updatedAmount = Number(currentAmount)+Number(paymentForm.amount)
                const res = await axios.patch(`members/update/${paymentForm.member}`, { total_cash_paid: updatedAmount })
                console.log(updatedAmount)
                console.log("Saved", responce.data, "updated ", res.data)
            }
            setPaymentForm({
                'member':'',
                'amount':'',
                'payment_type':''
            })
            alert("Payment Added Successfully")
        }
        catch (error) {
            console.error(error)
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
    flex
    items-center
    justify-center
    bg-white/40
    '>
    
    <form onSubmit={handleSubmit} className='
    flex
    flex-col
    gap-2
    justify-center
    items-start
    bg-gray-950
    text-white
    p-4
    rounded-[8px]
    '>
        <h1>Add New Payment</h1>
        <p>Add a payment and assign payment type</p>
        <div className="
        flex
        flex-col
        items-start
        w-full
        ">
            <h1>Payment From:</h1>
            <select name='member' onChange={(e)=>handleChange(e)}
            className='w-full bg-gray-950'
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
            <h1>Enter the Amount</h1>
            <CurrencyInput name='amount' placeholder='Please Enter the amount'
            onChange={(e)=>handleChange(e)} 
            value={paymentForm.amount}
            ></CurrencyInput>
        </div>
        <select value={paymentForm.payment_type} name='payment_type' className='w-full bg-gray-950' onChange={(e)=>handleChange(e)}>
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