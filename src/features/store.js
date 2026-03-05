import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from './sidebarSlice'
import currentPageReducer from './currentPageSlice'
import markAttendanceReducer from './markAttendanceSlice'
export const store = configureStore({
    reducer:{
        sidebarState: sidebarReducer,
        currentPageState:currentPageReducer,
        markAttendanceState:markAttendanceReducer,
    }
})