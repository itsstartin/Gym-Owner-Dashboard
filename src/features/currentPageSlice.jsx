import { createSlice } from "@reduxjs/toolkit";
const currentPageSlice = createSlice({
    name:'currentPageState',
    initialState:{value:'Dashboard'},
    reducers:{
        dashboardOn:(state)=>{state.value='Dashboard'},
        membersOn:(state)=>{state.value='Members'},
        paymentsOn:(state)=>{state.value='Payments'},
        reportsOn:(state)=>{state.value='Reports'}, 
        addMemberOn:(state)=>{state.value='addMember'},
        addPaymentOn:(state)=>{state.value='addPayment'},
        logoutOn:(state)=>{state.value='logout'},
    }
})
export const {dashboardOn,membersOn,paymentsOn,reportsOn, addMemberOn, addPaymentOn, logoutOn} = currentPageSlice.actions;
export default currentPageSlice.reducer;