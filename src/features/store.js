import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from './sidebarSlice'
import currentPageReducer from './currentPageSlice'
import markAttendanceReducer from './markAttendanceSlice'
import dataVersionReducer from './dataVersionSlice'
export const store = configureStore({
    reducer:{
        sidebarState: sidebarReducer,
        currentPageState:currentPageReducer,
        markAttendanceState:markAttendanceReducer,
        dataVersion: dataVersionReducer,
    }
})
