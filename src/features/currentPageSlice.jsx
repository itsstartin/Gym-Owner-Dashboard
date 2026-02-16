import { createSlice } from "@reduxjs/toolkit";
const currentPageSlice = createSlice({
    name:'currentPageState',
    initialState:{value:'Dashboard'},
    reducers:{
        dashboardOn:(state)=>{state.value='Dashboard'},
        membersOn:(state)=>{state.value='Members'},
        paymentsOn:(state)=>{state.value='Payments'},
        addMemberOn:(state)=>{state.value='addMember'},
        reportsOn:(state)=>{state.value='Reports'}, 
    }
})
export const {dashboardOn,membersOn,paymentsOn,reportsOn, addMemberOn} = currentPageSlice.actions;
export default currentPageSlice.reducer;