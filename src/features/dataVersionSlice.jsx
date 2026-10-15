import { createSlice } from '@reduxjs/toolkit'

// A write invalidates the in-memory GET cache. Pages use this revision to
// refresh only when they become visible again, rather than on every sidebar
// visit.
const dataVersionSlice = createSlice({
  name: 'dataVersion',
  initialState: 0,
  reducers: {
    dataChanged: (state) => state + 1,
  },
})

export const { dataChanged } = dataVersionSlice.actions
export default dataVersionSlice.reducer
