import {createSlice} from '@reduxjs/toolkit'

const markAttendanceSlice = createSlice({
    name:'markAttendanceState',
    initialState: {value:false},
    reducers:{
        markAttendanceOn:(state)=>{state.value=true},
        markAttendanceOff:(state)=>{state.value=false}
    }
})
export const {markAttendanceOn,markAttendanceOff} = markAttendanceSlice.actions;
export default markAttendanceSlice.reducer