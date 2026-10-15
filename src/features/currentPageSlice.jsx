import { createSlice } from "@reduxjs/toolkit";
const currentPageSlice = createSlice({
    name:'currentPageState',
    initialState:{value:'Dashboard', memberFilters:{}},
    reducers:{
        dashboardOn:(state)=>{state.value='Dashboard'},
        membersOn:(state)=>{state.value='Members'; state.memberFilters={}},
        membersWithFilters:(state, action)=>{state.value='Members'; state.memberFilters=action.payload},
        paymentsOn:(state)=>{state.value='Payments'},
        reportsOn:(state)=>{state.value='Reports'}, 
        addMemberOn:(state)=>{state.value='addMember'},
        addPaymentOn:(state)=>{state.value='addPayment'},
        notificationsOn:(state)=>{state.value='Notifications'},
        auditLogsOn:(state)=>{state.value='AuditLogs'},
        settingsOn:(state)=>{state.value='Settings'},
        logoutOn:(state)=>{state.value='logout'},
    }
})
export const {dashboardOn,membersOn,membersWithFilters,paymentsOn,reportsOn, addMemberOn, addPaymentOn,notificationsOn,auditLogsOn,settingsOn, logoutOn} = currentPageSlice.actions;
export default currentPageSlice.reducer;
