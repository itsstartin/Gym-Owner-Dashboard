import { createSlice } from "@reduxjs/toolkit";

const selectPage = (state, page) => {
    state.value = page
    state.visitedPages[page] = true
}

const currentPageSlice = createSlice({
    name:'currentPageState',
    initialState:{value:'Dashboard', memberFilters:{}, visitedPages:{Dashboard:true}},
    reducers:{
        dashboardOn:(state)=>{selectPage(state, 'Dashboard')},
        membersOn:(state)=>{selectPage(state, 'Members'); state.memberFilters={}},
        membersWithFilters:(state, action)=>{selectPage(state, 'Members'); state.memberFilters=action.payload},
        paymentsOn:(state)=>{selectPage(state, 'Payments')},
        reportsOn:(state)=>{selectPage(state, 'Reports')},
        addMemberOn:(state)=>{selectPage(state, 'Members'); state.value='addMember'},
        addPaymentOn:(state)=>{selectPage(state, 'Payments'); state.value='addPayment'},
        notificationsOn:(state)=>{selectPage(state, 'Notifications')},
        auditLogsOn:(state)=>{selectPage(state, 'AuditLogs')},
        settingsOn:(state)=>{selectPage(state, 'Settings')},
        logoutOn:(state)=>{state.value='logout'},
    }
})
export const {dashboardOn,membersOn,membersWithFilters,paymentsOn,reportsOn, addMemberOn, addPaymentOn,notificationsOn,auditLogsOn,settingsOn, logoutOn} = currentPageSlice.actions;
export default currentPageSlice.reducer;
