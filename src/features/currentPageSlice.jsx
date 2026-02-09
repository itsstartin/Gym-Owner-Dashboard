import { createSlice } from "@reduxjs/toolkit";
const currentPageSlice = createSlice({
    name:'currentPageState',
    initialState:{value:'Dashboard'},
    reducers:{
        dashboardOn:(state)=>{state.value='Dashboard'},
        membersOn:(state)=>{state.value='Members'},
        paymentOn:(state)=>{state.value='Payment'},   
    }
})
export const {dashboardOn,membersOn,paymentOn} = currentPageSlice.actions;
export default currentPageSlice.reducer;