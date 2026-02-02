import {createSlice} from '@reduxjs/toolkit'

const sidebarSlice = createSlice({
    name:'sidebarState',
    initialState: {value:0},
    reducers:{
        sidebarOn:(state)=>{state.value=1},
        sidebarOff:(state)=>{state.value=0}
    }
})

export const {sidebarOn,sidebarOff} = sidebarSlice.actions;
export default sidebarSlice.reducer