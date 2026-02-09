import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from './sidebarSlice'
import currentPageReducer from './currentPageSlice'

export const store = configureStore({
    reducer:{
        sidebarState: sidebarReducer,
        currentPageState:currentPageReducer,
    }
})